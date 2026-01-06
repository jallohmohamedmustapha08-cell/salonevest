"use server";

import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";

export async function updateUserStatus(userId: string, updates: { status?: string, type?: string }) {
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
            .from('profiles')
            .update(updates)
            .eq('id', userId);

        if (error) {
            console.error(`Error updating user ${userId}:`, error);
            return { error: error.message };
        }

        revalidatePath("/admin");
        return { success: true };
    } catch (err: any) {
        return { error: err.message };
    }
}
