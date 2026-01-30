"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

interface AvatarUploadProps {
    uid: string;
    url: string | null;
    size: number;
    onUpload: (url: string) => void;
}

export default function AvatarUpload({ uid, url, size, onUpload }: AvatarUploadProps) {
    const [avatarUrl, setAvatarUrl] = useState<string | null>(url);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        if (url) downloadImage(url);
    }, [url]);

    const downloadImage = async (path: string) => {
        try {
            const { data, error } = await supabase.storage.from("avatars").download(path);
            if (error) {
                throw error;
            }
            const url = URL.createObjectURL(data);
            setAvatarUrl(url);
        } catch (error) {
            console.log("Error downloading image: ", error);
        }
    };

    const uploadAvatar = async (event: any) => {
        try {
            setUploading(true);

            if (!event.target.files || event.target.files.length === 0) {
                throw new Error("You must select an image to upload.");
            }

            const file = event.target.files[0];
            const fileExt = file.name.split(".").pop();
            const filePath = `${uid}-${Math.random()}.${fileExt}`;

            const { error: uploadError } = await supabase.storage.from("avatars").upload(filePath, file);

            if (uploadError) {
                throw uploadError;
            }

            onUpload(filePath);
        } catch (error) {
            alert("Error uploading avatar!");
            console.log(error);
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="flex flex-col items-center gap-4">
            {avatarUrl ? (
                <img
                    src={avatarUrl}
                    alt="Avatar"
                    className="avatar image rounded-full object-cover"
                    style={{ height: size, width: size }}
                />
            ) : (
                <div
                    className="bg-gray-700 rounded-full flex items-center justify-center text-gray-400 font-bold text-2xl"
                    style={{ height: size, width: size }}
                >
                    ?
                </div>
            )}
            <div style={{ width: size }}>
                <label className="block w-full text-center bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg cursor-pointer transition">
                    {uploading ? "Uploading..." : "Upload"}
                    <input
                        style={{
                            visibility: "hidden",
                            position: "absolute",
                        }}
                        type="file"
                        id="single"
                        accept="image/*"
                        onChange={uploadAvatar}
                        disabled={uploading}
                    />
                </label>
            </div>
        </div>
    );
}
