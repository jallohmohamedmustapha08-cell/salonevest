"use server";

import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";

export async function makeInvestment(projectId: number, userId: string, amount: number) {
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
        // Use the RPC function we verified in SQL
        const { data, error } = await supabase.rpc('invest', {
            project_id_arg: projectId,
            investor_id_arg: userId,
            amount_arg: amount
        });

        if (error) {
            console.error("RPC Error:", error);
            return { error: error.message };
        }

        if (data && data.error) {
            return { error: data.error };
        }

        revalidatePath("/dashboard/investor");
        revalidatePath("/admin");
        revalidatePath("/dashboard/entrepreneur"); // Ensure entrepreneur sees new funds
        return { success: true };

    } catch (err: any) {
        return { error: err.message };
    }
}
