'use server';

import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!, // Use Service Role for Admin actions
    {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
    }
);

// --- 1. Get Wallet Balance ---
export async function getWalletBalance(userId: string) {
    try {
        const { data, error } = await supabase
            .from('transactions')
            .select('amount')
            .eq('user_id', userId);

        if (error) throw error;

        // Sum up all transactions
        const balance = data.reduce((acc, tx) => acc + Number(tx.amount), 0);
        return { success: true, balance };

    } catch (error: any) {
        console.error("Get Balance Error:", error);
        return { error: error.message };
    }
}

// --- 2. Request Withdrawal ---
export async function requestWithdrawal(userId: string, amount: number, method: string, details: string) {
    try {
        // 1. Check Balance First (Service Role can read all, so query strict)
        const balanceRes = await getWalletBalance(userId);
        if (balanceRes.error || (balanceRes.balance !== undefined && balanceRes.balance < amount)) {
            return { error: "Insufficient funds." };
        }

        // 2. Create Request
        const { error } = await supabase
            .from('withdrawal_requests')
            .insert({
                user_id: userId,
                amount,
                method,
                details,
                status: 'pending'
            });

        if (error) throw error;

        revalidatePath('/dashboard/investor');
        return { success: true };

    } catch (error: any) {
        console.error("Withdrawal Request Error:", error);
        return { error: error.message };
    }
}

// --- 3. Approve Withdrawal (Admin Only) ---
export async function approveWithdrawal(requestId: string, adminId: string) {
    try {
        // 1. Verify Admin (Redundant check if RLS works, but good for safety)
        const { data: adminUser } = await supabase.from('profiles').select('role').eq('id', adminId).single();
        if (adminUser?.role !== 'admin') return { error: "Unauthorized" };

        // 2. Fetch Request
        const { data: request, error: fetchError } = await supabase
            .from('withdrawal_requests')
            .select('*')
            .eq('id', requestId)
            .single();

        if (fetchError || !request) return { error: "Request not found" };
        if (request.status !== 'pending') return { error: "Request already processed" };

        // 3. Double Check Balance (Race condition check)
        const balanceRes = await getWalletBalance(request.user_id);
        if (balanceRes.balance! < request.amount) return { error: "User has insufficient funds now." };

        // 4. ATOMIC TRANSACTION (Simulation):
        // A. Update Request Status -> Approved
        const { error: updateError } = await supabase
            .from('withdrawal_requests')
            .update({ status: 'approved', updated_at: new Date().toISOString() })
            .eq('id', requestId);

        if (updateError) throw updateError;

        // B. Debit User Wallet (Insert negative transaction)
        const { error: debitError } = await supabase
            .from('transactions')
            .insert({
                user_id: request.user_id,
                amount: -Math.abs(request.amount), // Negative
                type: 'withdrawal',
                description: `Withdrawal via ${request.method} (${request.details})`,
                reference_id: requestId
            });

        if (debitError) {
            // CRITICAL: If debit fails, we should rollback status (Manual rollback for MVP)
            await supabase.from('withdrawal_requests').update({ status: 'pending' }).eq('id', requestId);
            throw debitError;
        }

        revalidatePath('/admin');
        return { success: true };

    } catch (error: any) {
        console.error("Approve Withdrawal Error:", error);
        return { error: error.message };
    }
}

// --- 4. Distribute Returns (Admin Only) ---
export async function distributeReturns(projectId: number | string, totalReturnAmount: number, adminId: string) {
    try {
        // 1. Verify Admin
        const { data: adminUser } = await supabase.from('profiles').select('role').eq('id', adminId).single();
        if (adminUser?.role !== 'admin') return { error: "Unauthorized" };

        // 2. Fetch Project & Investments
        const { data: project } = await supabase.from('projects').select('funding, title').eq('id', projectId).single();
        if (!project) return { error: "Project not found" };

        const { data: investments } = await supabase
            .from('investments')
            .select('investor_id, amount')
            .eq('project_id', projectId);

        if (!investments || investments.length === 0) return { error: "No investors found for this project." };

        // 3. Validate Logic
        const totalInvested = project.funding || investments.reduce((sum, inv) => sum + Number(inv.amount), 0);
        if (totalInvested <= 0) return { error: "Invalid project funding data." };

        // 4. Distribute Loop
        const transactions: any[] = [];
        let totalDistributed = 0;

        // Group investments by investor (in case one investor invested multiple times)
        const investorMap: Record<string, number> = {};
        investments.forEach(inv => {
            investorMap[inv.investor_id] = (investorMap[inv.investor_id] || 0) + Number(inv.amount);
        });

        for (const [investorId, investedAmount] of Object.entries(investorMap)) {
            // Formula: Share = (Invested / TotalInvested) * TotalReturns
            const share = (investedAmount / totalInvested) * totalReturnAmount;

            // Round to 2 decimals
            const creditAmount = Math.floor(share * 100) / 100;

            if (creditAmount > 0) {
                transactions.push({
                    user_id: investorId,
                    amount: creditAmount,
                    type: 'return',
                    description: `Return from ${project.title} (Invested: $${investedAmount})`,
                    reference_id: projectId.toString()
                });
                totalDistributed += creditAmount;
            }
        }

        // 5. Bulk Insert Transactions
        if (transactions.length > 0) {
            const { error: txError } = await supabase.from('transactions').insert(transactions);
            if (txError) throw txError;
        }

        // 6. Update Project Status -> Repaid (or similar, maybe keeping it Active but noting it?)
        // Let's mark it 'Repaid' to close the cycle
        // Note: Project status enum might need update, but let's assume text for now or keep 'Active' if 'Repaid' not valid
        // Assuming 'Completed' or 'Repaid' is valid. The user asked for "Returns", so let's log it.
        // Actually, let's just create a log or better yet, verify 'released' update logic if exists.
        // For now, let's assume we don't change status to avoid breaking 'Active' filters if 'Repaid' isn't handled yet.
        // We will just return success.

        revalidatePath('/dashboard/investor');
        revalidatePath('/admin');
        return { success: true, count: transactions.length, total: totalDistributed };

    } catch (error: any) {
        console.error("Distribute Returns Error:", error);
        return { error: error.message };
    }
}
