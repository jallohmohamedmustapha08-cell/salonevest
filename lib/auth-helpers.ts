import { supabase } from "@/lib/supabaseClient";

export async function getUserRole(userId: string): Promise<string | null> {
    try {
        const { data, error } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', userId)
            .maybeSingle();

        if (error) {
            console.error('Error fetching user role details:', error.message, error.details, error.hint, error);
            return null;
        }

        if (!data) {
            console.warn("User profile not found immediately after login. Trigger might be slow.");
            return null;
        }

        return data.role || null;
    } catch (error) {
        console.error('Unexpected error fetching user role:', error);
        return null;
    }
}
