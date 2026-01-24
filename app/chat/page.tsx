import { getConversations } from "@/app/actions/chat";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import ChatLayout from "./ChatLayout";

export default async function ChatPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    const { conversations, error } = await getConversations();

    if (error) {
        return (
            <div className="p-8 text-center text-red-500">
                Error loading conversations: {error}
            </div>
        );
    }

    return (
        <div className="h-[calc(100vh-64px)]">
            {/* Note: Navbar height assumed, adjust if needed */}
            <ChatLayout
                initialConversations={conversations || []}
                currentUserId={user.id}
            />
        </div>
    );
}
