"use server";

import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";

export async function deleteUser(userId: string) {
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

    if (!userId) {
        return { error: "Missing user ID" };
    }

    try {
        // 0. Unassign user from projects (if they are staff)
        const { error: unassignError } = await supabaseAdmin
            .from('projects')
            .update({ assigned_staff_id: null })
            .eq('assigned_staff_id', userId);

        if (unassignError) {
            console.error("Error unassigning staff:", unassignError);
        }

        // 1. Delete user's projects (if any) to satisfy FK constraints
        const { error: projectError } = await supabaseAdmin
            .from('projects')
            .delete()
            .eq('entrepreneur_id', userId);

        if (projectError) {
            console.error("Error deleting user projects:", projectError);
            // Continue? Or stop? Usually stop to be safe, but maybe log and try profile.
            // If projects exist, deleting profile will fail.
        }

        // 2. Delete user's profile
        const { error: profileError } = await supabaseAdmin
            .from('profiles')
            .delete()
            .eq('id', userId);

        if (profileError) {
            console.error("Error deleting user profile:", profileError);
            // If this fails, Auth delete MIGHT fail if constrained, but usually we try.
        }

        // 3. Delete from Auth
        const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);

        if (error) {
            console.error("Error deleting user:", error);
            return { error: error.message };
        }

        revalidatePath("/admin");
        return { success: true };
    } catch (err: any) {
        console.error("Unexpected error:", err);
        return { error: err.message };
    }
}
