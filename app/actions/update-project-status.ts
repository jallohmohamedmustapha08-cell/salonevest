"use server";

import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import { analyzeProjectTrustScore } from "./analyze-trust-score";

export async function updateProjectStatus(projectId: number, status: 'Active' | 'Rejected' | 'Pending' | 'Paused') {
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
        const { error } = await supabaseAdmin
            .from('projects')
            .update({ status })
            .eq('id', projectId);

        if (error) {
            console.error(`Error updating project ${projectId} to ${status}:`, error);
            return { error: error.message };
        }

        // Trigger AI Trust Score Analysis automatically if Approved
        // Use await to ensure analysis runs before returning, or remove await if latency is an issue.
        if (status === 'Pending') {
            // Side Effect: If Unverifying (Active -> Pending), reset all "Verified" reports to "Submitted" so they can be re-reviewed.
            await supabaseAdmin
                .from('verification_reports')
                .update({ status: 'Submitted' })
                .eq('project_id', projectId)
                .eq('status', 'Verified');
        }

        // Trigger AI Trust Score Analysis automatically if Approved
        // Use await to ensure analysis runs before returning, or remove await if latency is an issue.
        if (status === 'Active') {
            await analyzeProjectTrustScore(projectId);
        }

        revalidatePath("/admin");
        return { success: true };
    } catch (err: any) {
        return { error: err.message };
    }
}
