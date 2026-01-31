import { supabase } from "@/lib/supabaseClient";

export async function getUserRole(userId: string): Promise<string | null> {
    try {
        const { data, error } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', userId)
            .maybeSingle();

        if (error) {
            // Check for security error (blocked storage)
            if (error.message && (error.message.includes('SecurityError') || error.message.includes('The request was denied'))) {
                console.warn('Handling SecurityError in getUserRole: Storage access is blocked. Returning null role.');
                return null; // Fail gracefully
            }

            console.error('Error fetching user role details:', error.message, error.details, error.hint, error);
            return null;
        }

        if (!data) {
            console.warn("User profile not found immediately after login. Trigger might be slow.");
            return null;
        }

        return data.role || null;
    } catch (error: any) {
        // Catch runtime errors like "SecurityError: The request was denied" that might be thrown synchronously
        if (error.name === 'SecurityError' || error.message?.includes('The request was denied')) {
            console.warn('Caught SecurityError in getUserRole (likely blocked storage). Returning null.');
            return null;
        }
        console.error('Unexpected error fetching user role:', error);
        return null;
    }
}
