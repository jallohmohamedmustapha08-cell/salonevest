import { supabase } from "@/lib/supabaseClient";

export async function getUserRole(userId: string): Promise<string | null> {
    try {
        const { data, error } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', userId)
            .single();

        if (error) {
            console.error('Error fetching user role:', error);
            return null;
        }

        return data?.role || null;
    } catch (error) {
        console.error('Unexpected error fetching user role:', error);
        return null;
    }
}
