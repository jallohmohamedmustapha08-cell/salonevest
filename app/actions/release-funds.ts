"use server";

import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";

export async function releaseFunds(projectId: number, amount: number) {
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
        // 1. Fetch Project
        const { data: project, error: fetchError } = await supabase
            .from('projects')
            .select('funding, released')
            .eq('id', projectId)
            .single();

        if (fetchError || !project) {
            return { error: "Project not found" };
        }

        const currentFunding = Number(project.funding) || 0;
        const currentReleased = Number(project.released) || 0;

        if (currentReleased + amount > currentFunding) {
            return { error: `Cannot release more than raised funding. Raised: ${currentFunding}, Already Released: ${currentReleased}` };
        }

        // 2. Update Project
        const { error: updateError } = await supabase
            .from('projects')
            .update({ released: currentReleased + amount })
            .eq('id', projectId);

        if (updateError) {
            throw updateError;
        }

        revalidatePath("/admin");
        revalidatePath("/dashboard/entrepreneur");
        return { success: true };

    } catch (err: any) {
        console.error("Release Funds Error:", err);
        return { error: err.message };
    }
}
