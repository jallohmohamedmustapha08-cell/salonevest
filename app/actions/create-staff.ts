"use server";

import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";

export async function createStaffUser(formData: FormData) {
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

    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const fullName = formData.get("fullName") as string;
    const role = formData.get("role") as string;
    const region = formData.get("region") as string;

    if (!email || !password || !fullName || !role) {
        return { error: "Missing required fields" };
    }

    try {
        const { data, error } = await supabaseAdmin.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: {
                full_name: fullName,
                role: role, // 'staff', 'admin', etc.
                region: region || null,
            },
        });

        if (error) {
            console.error("Error creating user:", error);
            return { error: error.message };
        }

        // Explicitly create/update profile to ensure all fields are set
        // The trigger might have created a partial profile, so we upsert
        const { error: profileError } = await supabaseAdmin
            .from('profiles')
            .upsert({
                id: data.user.id,
                email: email,
                full_name: fullName,
                role: role,
                region: region || null,
                status: 'Active'
            });

        if (profileError) {
            console.error("Error updating profile:", profileError);
            // We don't return error here as the user *was* created, but might need manual fix
        }

        revalidatePath("/admin");
        return { success: true, userId: data.user.id };
    } catch (err: any) {
        console.error("Unexpected error:", err);
        return { error: err.message };
    }
}
