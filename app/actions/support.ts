'use server';

import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function createSupportTicket(name: string, email: string) {
    try {
        const { data, error } = await supabaseAdmin
            .from('support_tickets')
            .insert({ guest_name: name, guest_email: email })
            .select()
            .single();

        if (error) throw error;
        return { success: true, ticket: data };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function sendGuestMessage(ticketId: string, content: string) {
    try {
        const { data, error } = await supabaseAdmin
            .from('support_messages')
            .insert({
                ticket_id: ticketId,
                sender_type: 'guest',
                content: content
            })
            .select()
            .single();

        if (error) throw error;

        // Broadcast to channel so client sees it immediately (and moderators)
        // Note: In serverless, keeping a socket open for broadcast can be tricky.
        // We will attempt it, but client should also optimistic update.
        // For the *moderator* reply reaching the guest, this is critical.

        return { success: true, message: data };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

// For Poll-based fetching (robust fallback)
export async function getTicketMessages(ticketId: string) {
    try {
        const { data, error } = await supabaseAdmin
            .from('support_messages')
            .select('*')
            .eq('ticket_id', ticketId)
            .order('created_at', { ascending: true });

        if (error) throw error;
        return { success: true, messages: data };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function getOpenTickets() {
    try {
        const { data, error } = await supabaseAdmin
            .from('support_tickets')
            .select('*')
            .eq('status', 'open')
            .order('last_message_at', { ascending: false });

        if (error) throw error;
        return { success: true, tickets: data };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function sendModeratorMessage(ticketId: string, userId: string, content: string) {
    try {
        const { data, error } = await supabaseAdmin
            .from('support_messages')
            .insert({
                ticket_id: ticketId,
                sender_type: 'moderator',
                sender_id: userId,
                content: content
            })
            .select()
            .single();

        if (error) throw error;
        return { success: true, message: data };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function updateTicketStatus(ticketId: string, status: 'open' | 'closed' | 'resolved') {
    try {
        const { error } = await supabaseAdmin
            .from('support_tickets')
            .update({ status: status })
            .eq('id', ticketId);

        if (error) throw error;
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}
