"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

interface UserAvatarProps {
    uid?: string;
    url?: string | null;
    size?: number;
    className?: string;
    fallbackChar?: string;
}

export default function UserAvatar({ uid, url, size = 40, className = "", fallbackChar = "?" }: UserAvatarProps) {
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

    useEffect(() => {
        if (url) {
            // If it's a full URL (e.g. from Google Auth or external), use it. 
            // If it's a path (e.g. "uid-123.png"), download it.
            if (url.startsWith("http")) {
                setAvatarUrl(url);
            } else {
                downloadImage(url);
            }
        } else {
            setAvatarUrl(null);
        }
    }, [url]);

    const downloadImage = async (path: string) => {
        try {
            // Use the public URL method for speed if bucket is public, 
            // or download if private. We set it to public earlier.
            const { data } = supabase.storage.from("avatars").getPublicUrl(path);
            if (data) {
                setAvatarUrl(data.publicUrl);
            }
        } catch (error) {
            console.log("Error downloading image: ", error);
        }
    };

    if (avatarUrl) {
        return (
            <img
                src={avatarUrl}
                alt="Avatar"
                className={`rounded-full object-cover border border-gray-600 ${className}`}
                style={{ height: size, width: size }}
            />
        );
    }

    return (
        <div
            className={`bg-gray-700/50 rounded-full flex items-center justify-center text-gray-400 font-bold border border-gray-600 ${className}`}
            style={{ height: size, width: size, fontSize: size * 0.4 }}
        >
            {fallbackChar.toUpperCase().charAt(0)}
        </div>
    );
}
