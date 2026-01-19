"use server";

import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
);

export async function searchProfiles(query: string) {
    if (!query || query.length < 3) return [];

    const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, email, phone')
        .or(`email.ilike.%${query}%,full_name.ilike.%${query}%`)
        .limit(5);

    if (error) {
        console.error("Search Profiles Error:", error);
        return [];
    }
    return data;
}
