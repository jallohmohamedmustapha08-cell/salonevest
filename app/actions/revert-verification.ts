"use server";

import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";

export async function revertAgentVerification(agentId: string) {
    const supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        {
            auth: {
                autoRefreshToken: false,
                persistSession: false,
            },
        }
    );

    try {
        // 1. Update Agent Profile Status back to 'Pending' (or whatever default is)
        // We will assume 'Pending' is the state for unverified agents.
        const { error: updateError } = await supabaseAdmin
            .from('profiles')
            .update({ status: 'Pending' })
            .eq('id', agentId);

        if (updateError) throw new Error("Failed to revert profile status: " + updateError.message);

        // Optional: We could mark the verification record as 'Revoked' if we added a status column to it.
        // For now, we leave the log as a historical record that "User X verified User Y at Time Z".
        // The current status of User Y is what matters.

        revalidatePath("/admin");
        revalidatePath("/dashboard/staff");

        return { success: true };

    } catch (err: any) {
        console.error("Revert Verification Error:", err);
        return { error: err.message };
    }
}
