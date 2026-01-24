'use server'

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function createConversation(otherUserId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { error: "Not authenticated" };
    }

    // Check if conversation already exists
    // We check both combinations: (me, other) and (other, me)
    const { data: existingConversations, error: fetchError } = await supabase
        .from('conversations')
        .select('id')
        .or(`and(participant1_id.eq.${user.id},participant2_id.eq.${otherUserId}),and(participant1_id.eq.${otherUserId},participant2_id.eq.${user.id})`)
        .single();

    if (existingConversations) {
        return { id: existingConversations.id };
    }

    // Create new conversation
    // Ideally ensure participant1 is always the 'smaller' ID to enforce uniqueness logic if needed, 
    // but for now we'll just insert. The unique constraint in DB might fail if we are unlucky with race conditions 
    // but it's rare.
    const { data: newConversation, error: createError } = await supabase
        .from('conversations')
        .insert({
            participant1_id: user.id,
            participant2_id: otherUserId
        })
        .select()
        .single();

    if (createError) {
        // If error is unique violation, try fetching again (race condition)
        if (createError.code === '23505') { // unique_violation
            const { data: retryExisting } = await supabase
                .from('conversations')
                .select('id')
                .or(`and(participant1_id.eq.${user.id},participant2_id.eq.${otherUserId}),and(participant1_id.eq.${otherUserId},participant2_id.eq.${user.id})`)
                .single();
            if (retryExisting) return { id: retryExisting.id };
        }
        console.error("Error creating conversation:", createError);
        return { error: "Failed to create conversation" };
    }

    return { id: newConversation.id };
}

export async function sendMessage(conversationId: string, content: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { error: "Not authenticated" };
    }

    if (!content.trim()) {
        return { error: "Message cannot be empty" };
    }

    const { error } = await supabase
        .from('messages')
        .insert({
            conversation_id: conversationId,
            sender_id: user.id,
            content
        });

    if (error) {
        console.error("Error sending message:", error);
        return { error: "Failed to send message" };
    }

    // Revalidate paths where chat might be visible
    revalidatePath('/chat');
    revalidatePath(`/chat/${conversationId}`);

    return { success: true };
}

export async function getConversations() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { error: "Not authenticated" };
    }

    // Fetch conversations and expand participants to get names
    const { data: conversations, error } = await supabase
        .from('conversations')
        .select(`
            *,
            participant1:participant1_id(id, full_name, business_name, role),
            participant2:participant2_id(id, full_name, business_name, role)
        `)
        .or(`participant1_id.eq.${user.id},participant2_id.eq.${user.id}`)
        .order('updated_at', { ascending: false });

    if (error) {
        console.error("Error fetching conversations:", error);
        return { error: error.message };
    }

    // Process to identify "other user" for the UI
    const processedConversations = conversations.map((conv: any) => {
        const isParticipant1 = conv.participant1_id === user.id;
        const otherParticipant = isParticipant1 ? conv.participant2 : conv.participant1;
        return {
            ...conv,
            otherParticipant
        };
    });

    return { conversations: processedConversations };
}

export async function getMessages(conversationId: string) {
    const supabase = await createClient();
    const { data: messages, error } = await supabase
        .from('messages')
        .select(`
            *,
            sender:sender_id(full_name, business_name)
        `)
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

    if (error) {
        console.error("Error fetching messages:", error);
        return { error: error.message };
    }

    return { messages };
}

// Admin only function
export async function getAllConversationsAdmin() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { error: "Not authenticated" };
    }

    // Verify admin role
    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    if (profile?.role !== 'admin') {
        return { error: "Unauthorized" };
    }

    const { data: conversations, error } = await supabase
        .from('conversations')
        .select(`
            *,
            participant1:participant1_id(id, full_name, business_name, role, email),
            participant2:participant2_id(id, full_name, business_name, role, email)
        `)
        .order('updated_at', { ascending: false });

    if (error) {
        return { error: error.message };
    }

    return { conversations };
}
