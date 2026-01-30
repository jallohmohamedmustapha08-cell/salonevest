"use server";

import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";

export async function verifyFieldAgent(formData: FormData) {
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

    const agentId = formData.get("agentId") as string;
    const verifierId = formData.get("verifierId") as string;
    const comment = formData.get("comment") as string;
    const proofImage = formData.get("image") as File;

    if (!agentId || !verifierId || !comment) {
        return { error: "Missing required fields" };
    }

    try {
        let imageUrl = null;

        // 1. Upload Proof Image (if exists)
        if (proofImage && proofImage.size > 0) {
            const fileExt = proofImage.name.split('.').pop();
            const fileName = `agent-verify-${agentId}-${Date.now()}.${fileExt}`;
            const { error: uploadError } = await supabaseAdmin.storage
                .from('verification-images') // Reuse existing bucket
                .upload(fileName, proofImage, {
                    contentType: proofImage.type,
                    upsert: false
                });

            if (uploadError) throw new Error("Image upload failed: " + uploadError.message);

            const { data: { publicUrl } } = supabaseAdmin.storage
                .from('verification-images')
                .getPublicUrl(fileName);

            imageUrl = publicUrl;
        }

        // 2. Log Verification
        const { error: logError } = await supabaseAdmin
            .from('agent_verifications')
            .insert({
                agent_id: agentId,
                verifier_id: verifierId,
                comment: comment,
                proof_image_url: imageUrl
            });

        if (logError) throw new Error("Failed to log verification: " + logError.message);

        // 3. Update Agent Profile Status
        const { error: updateError } = await supabaseAdmin
            .from('profiles')
            .update({ status: 'Verified' })
            .eq('id', agentId);

        if (updateError) throw new Error("Failed to update profile status: " + updateError.message);

        revalidatePath("/dashboard/staff");
        return { success: true };

    } catch (err: any) {
        console.error("Agent Verification Error:", err);
        return { error: err.message };
    }
}
