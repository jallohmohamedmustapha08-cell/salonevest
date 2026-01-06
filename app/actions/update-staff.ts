"use server";

import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";

export async function updateStaffUser(formData: FormData) {
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

    const id = formData.get("id") as string;
    const fullName = formData.get("fullName") as string;
    const role = formData.get("role") as string;
    const region = formData.get("region") as string;
    const status = formData.get("status") as string;

    if (!id) {
        return { error: "Missing user ID" };
    }

    try {
        // Update public.profiles
        const { error } = await supabaseAdmin
            .from('profiles')
            .update({
                full_name: fullName,
                role: role,
                region: region || null,
                status: status
            })
            .eq('id', id);

        if (error) {
            console.error("Error updating profile:", error);
            return { error: error.message };
        }

        // Also update auth metadata if needed (optional but good for sync)
        await supabaseAdmin.auth.admin.updateUserById(id, {
            user_metadata: {
                full_name: fullName,
                role: role,
                region: region || null
            }
        });

        revalidatePath("/admin");
        return { success: true };
    } catch (err: any) {
        console.error("Unexpected error:", err);
        return { error: err.message };
    }
}
