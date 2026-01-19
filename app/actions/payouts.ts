"use server";

import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
    }
);

// --- 1. Release Project Funds (Admin Action) ---
export async function releaseProjectFunds(projectId: number | string, adminId: string, amount?: number) {
    try {
        // 1. Verify Admin
        const { data: adminUser } = await supabase.from('profiles').select('role').eq('id', adminId).single();
        if (adminUser?.role !== 'admin') return { error: "Unauthorized" };

        // 2. Fetch Project & Entrepreneur
        const { data: project } = await supabase
            .from('projects')
            .select('funding, entrepreneur_id, title, goal')
            .eq('id', projectId)
            .single();

        if (!project) return { error: "Project not found" };

        const amountToRelease = amount || project.funding || 0;
        if (amountToRelease <= 0) return { error: "No funds to release." };

        // 3. Check Group Membership
        const { data: groupMember } = await supabase
            .from('group_members')
            .select(`
                group_id,
                group:groups(id, leader_id, name)
            `)
            .eq('member_id', project.entrepreneur_id)
            .single();

        // --- PATH A: MEMBER OF A GROUP ---
        if (groupMember && groupMember.group) {
            const groupData = groupMember.group;
            // Supabase join might return array or object depending on relationship detection
            const group = Array.isArray(groupData) ? groupData[0] : groupData;

            if (!group) return { error: "Group data invalid" };
            const leaderId = group.leader_id;

            // Create Payout Request requiring approval
            const { error: payoutError } = await supabase
                .from('project_payouts')
                .insert({
                    project_id: projectId,
                    recipient_id: leaderId, // Send to Leader
                    amount: amountToRelease,
                    status: 'pending_approval',
                    approvals: []
                });

            if (payoutError) throw payoutError;

            // Simulate SMS
            console.log(`[SMS] To Group ${group.name} Members: Approval needed for payout of ${amountToRelease} to Leader.`);

            revalidatePath('/admin');
            return {
                success: true,
                message: `Funds pending approval. Sent request to Group Leader of '${group.name}'. Requires 2 member approvals.`
            };
        }

        // --- PATH B: INDIVIDUAL ENTREPRENEUR ---
        else {
            // Direct Wallet Credit
            const { error: txError } = await supabase
                .from('transactions')
                .insert({
                    user_id: project.entrepreneur_id,
                    amount: amountToRelease,
                    type: 'deposit',
                    description: `Project Funding Release: ${project.title}`,
                    reference_id: projectId.toString()
                });

            if (txError) throw txError;

            // Update Project Status (Optional, maybe 'Funded' -> 'In Progress'?)
            // await supabase.from('projects').update({ status: 'Active' }).eq('id', projectId);

            revalidatePath('/admin');
            return { success: true, message: `Funds released directly to entrepreneur wallet.` };
        }

    } catch (error: any) {
        console.error("Release Funds Error:", error);
        return { error: error.message };
    }
}

// --- 2. Approve Payout (Group Member Action) ---
export async function approvePayout(payoutId: string, memberId: string) {
    try {
        // 1. Fetch Payout & Group Info
        const { data: payout } = await supabase
            .from('project_payouts')
            .select('*, recipient:profiles(id)') // recipient is leader
            .eq('id', payoutId)
            .single();

        if (!payout) return { error: "Payout request not found" };
        if (payout.status !== 'pending_approval') return { error: "Payout already processed" };

        // 2. Verify Member belongs to the same group as the Leader (recipient)
        // Find the group where recipient is leader
        const { data: leaderGroup } = await supabase
            .from('groups')
            .select('id')
            .eq('leader_id', payout.recipient_id)
            .single();

        if (!leaderGroup) return { error: "Leader group not found" };

        const { data: isMember } = await supabase
            .from('group_members')
            .select('id')
            .eq('group_id', leaderGroup.id)
            .eq('member_id', memberId)
            .single();

        if (!isMember) return { error: "You are not a member of this group." };

        // 3. Add Approval
        const currentApprovals = (payout.approvals as string[]) || [];

        if (currentApprovals.includes(memberId)) {
            return { error: "You have already approved this." };
        }

        const newApprovals = [...currentApprovals, memberId];

        // 4. Check Threshold (Require 2)
        if (newApprovals.length >= 2) {
            // FINALIZE PAYOUT
            // A. Update Payout Status
            await supabase
                .from('project_payouts')
                .update({
                    status: 'completed',
                    approvals: newApprovals
                })
                .eq('id', payoutId);

            // B. Credit User (Leader)
            await supabase
                .from('transactions')
                .insert({
                    user_id: payout.recipient_id,
                    amount: payout.amount,
                    type: 'deposit',
                    description: `Group Project Payout (Approved by 2 members)`,
                    reference_id: payout.project_id.toString()
                });

            return { success: true, message: "Payout approved and funds released to Group Leader." };
        } else {
            // JUST UPDATE APPROVALS
            await supabase
                .from('project_payouts')
                .update({ approvals: newApprovals })
                .eq('id', payoutId);

            return { success: true, message: "Approval recorded. Waiting for more approvals." };
        }

    } catch (error: any) {
        console.error("Approve Payout Error:", error);
        return { error: error.message };
    }
}

// --- 3. Get Pending Payouts for Member ---
export async function getPendingPayouts(memberId: string) {
    try {
        // Find Pending Payouts where:
        // 1. Recipient is in the same group as Member
        // 2. Status is pending_approval
        // 3. Member has NOT already approved

        // A. Get Member's Group(s)
        const { data: userGroups } = await supabase
            .from('group_members')
            .select('group_id')
            .eq('member_id', memberId);

        if (!userGroups || userGroups.length === 0) return { success: true, payouts: [] };
        const groupIds = userGroups.map(g => g.group_id);

        // B. Find Leaders of these groups
        const { data: groups } = await supabase
            .from('groups')
            .select('leader_id, name')
            .in('id', groupIds);

        if (!groups) return { success: true, payouts: [] };

        const leaderIds = groups.map(g => g.leader_id);
        const groupMap = Object.fromEntries(groups.map(g => [g.leader_id, g.name]));

        // C. Find Payouts for these Leaders
        const { data: payouts } = await supabase
            .from('project_payouts')
            .select(`
                *,
                project:projects(title)
            `)
            .in('recipient_id', leaderIds)
            .eq('status', 'pending_approval');

        if (!payouts) return { success: true, payouts: [] };

        // D. Filter out ones already approved by this member
        const relevantPayouts = payouts.filter(p => {
            const approvals = (p.approvals as string[]) || [];
            return !approvals.includes(memberId);
        }).map(p => ({
            ...p,
            groupName: groupMap[p.recipient_id]
        }));

        return { success: true, payouts: relevantPayouts };

    } catch (error: any) {
        console.error("Get Pending Payouts Error:", error);
        return { error: error.message };
    }
}
