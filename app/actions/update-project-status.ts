"use server";

import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";

export async function updateProjectStatus(projectId: number, status: 'Active' | 'Rejected') {
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

        revalidatePath("/admin");
        return { success: true };
    } catch (err: any) {
        return { error: err.message };
    }
}
