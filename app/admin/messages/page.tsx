import { getAllConversationsAdmin } from "@/app/actions/chat";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import ChatLayout from "@/app/chat/ChatLayout";

// Helper to format names
const getName = (p: any) => p.business_name || p.full_name || 'Unknown';

export default async function AdminMessagesPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    // Verify admin role (double check, though action does it too)
    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    if (profile?.role !== 'admin') {
        redirect('/dashboard/entrepreneur'); // Or generic dashboard
    }

    const { conversations, error } = await getAllConversationsAdmin();

    if (error) {
        return (
            <div className="p-8 text-center text-red-500">
                Error loading conversations: {error}
            </div>
        );
    }

    // Transform conversations to fit ChatLayout expectation
    // We want the list to show "User A vs User B"
    const formattedConversations = conversations?.map((c: any) => {
        // We pretend the "otherParticipant" is a dummy object representing the chat title
        const title = `${getName(c.participant1)} & ${getName(c.participant2)}`;

        return {
            ...c,
            // ChatList logic: if I am not p1, other is p1.
            // Since Admin is not p1 (likely), other becomes p1.
            // So we override 'participant1' to hold our display info if needed, 
            // OR we just hack the 'otherParticipant' property if logic allows.
            // But ChatLayout calculates 'otherParticipant' internally if we passed raw data?
            // Wait, ChatLayout takes 'initialConversations'. 
            // ChatLayout -> ChatList. ChatList calculates 'otherParticipant' ?
            // Let's check ChatList implementation.
            // ChatList receives 'conversations'. 'conversations' in ChatList interface has 'otherParticipant'.

            // So we must pre-calculate 'otherParticipant' here.
            otherParticipant: {
                id: 'combined',
                full_name: title,
                business_name: title,
                role: 'Conversation'
            }
        };
    });

    return (
        <div className="h-[calc(100vh-64px)]">
            <div className="bg-white border-b px-4 py-2 flex justify-between items-center">
                <h1 className="text-xl font-bold text-gray-800">Platform Messages</h1>
                <span className="text-sm text-gray-500">Admin View (Read Only)</span>
            </div>
            {/* We pass readOnly implicitly by Admin role not being able to send, 
                but ChatWindow needs explict prop. ChatLayout doesn't pass 'readOnly'.
                
                We need to update ChatLayout to accept 'readOnly' and pass it to ChatWindow.
            */}
            <ChatLayout
                initialConversations={formattedConversations || []}
                currentUserId={user.id}
                readOnly={true}
            />
        </div>
    );
}
