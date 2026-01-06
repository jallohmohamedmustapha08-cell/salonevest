"use server";

import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";

export async function assignProject(projectId: number, staffId: string) {
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

    if (!projectId || !staffId) {
        return { error: "Missing project or staff ID" };
    }

    try {
        const { error } = await supabaseAdmin
            .from('projects')
            .update({ assigned_staff_id: staffId })
            .eq('id', projectId);

        if (error) {
            console.error("Error assigning project:", error);
            // Fallback: check if the column exists or is named differently if this fails
            return { error: error.message };
        }

        revalidatePath("/admin");
        return { success: true };
    } catch (err: any) {
        console.error("Unexpected error:", err);
        return { error: err.message };
    }
}
