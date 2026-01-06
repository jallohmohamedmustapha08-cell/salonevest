"use server";

import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";

export async function submitVerificationReport(formData: FormData) {
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

    const projectId = formData.get("projectId") as string;
    const agentId = formData.get("agentId") as string;
    const reportText = formData.get("reportText") as string;
    const imageFile = formData.get("image") as File;

    if (!projectId || !agentId || !reportText) {
        return { error: "Missing required fields" };
    }

    try {
        let imageUrl = null;

        if (imageFile && imageFile.size > 0) {
            const fileExt = imageFile.name.split('.').pop();
            const fileName = `${projectId}-${Date.now()}.${fileExt}`;
            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('verification-images')
                .upload(fileName, imageFile, {
                    contentType: imageFile.type,
                    upsert: false
                });

            if (uploadError) throw new Error("Image upload failed: " + uploadError.message);

            const { data: { publicUrl } } = supabase.storage
                .from('verification-images')
                .getPublicUrl(fileName);

            imageUrl = publicUrl;
        }

        const { error } = await supabase
            .from('verification_reports')
            .insert({
                project_id: projectId,
                agent_id: agentId,
                report_text: reportText,
                image_url: imageUrl,
                status: 'Submitted'
            });

        if (error) throw error;

        revalidatePath("/dashboard/staff");
        // revalidatePath("/admin/projects"); // Future: Show in admin panel
        return { success: true };

    } catch (err: any) {
        console.error("Verification Submission Error:", err);
        return { error: err.message };
    }
}
