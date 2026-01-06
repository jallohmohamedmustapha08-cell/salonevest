"use server";

import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";

export async function updateVerificationStatus(reportId: string, status: string) {
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

    try {
        const { error } = await supabase
            .from('verification_reports')
            .update({ status })
            .eq('id', reportId);

        if (error) throw error;

        revalidatePath("/admin");
        return { success: true };

    } catch (err: any) {
        console.error("Error updating verification status:", err);
        return { error: err.message };
    }
}
