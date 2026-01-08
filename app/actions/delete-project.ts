"use server";

import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";

export async function deleteProject(projectId: number) {
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
        // Delete project
        // Note: Dependent rows (reports, images) should automatically delete if ON DELETE CASCADE is set in DB.
        // If not, we might need to delete them manually here. Assuming CASCADE for now based on schema snippets seen earlier.
        const { error } = await supabaseAdmin
            .from('projects')
            .delete()
            .eq('id', projectId);

        if (error) {
            console.error(`Error deleting project ${projectId}:`, error);
            return { error: error.message };
        }

        revalidatePath("/admin");
        return { success: true };
    } catch (err: any) {
        return { error: err.message };
    }
}
