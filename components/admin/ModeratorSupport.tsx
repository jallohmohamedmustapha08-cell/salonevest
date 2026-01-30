"use client";

import { useEffect, useState } from "react";
import { getOpenTickets, sendModeratorMessage, getTicketMessages, updateTicketStatus } from "@/app/actions/support";
import { supabase } from "@/lib/supabaseClient";

interface ModeratorSupportProps {
    onMessageSent?: () => void;
}

export default function ModeratorSupport({ onMessageSent }: ModeratorSupportProps = {}) {
    const [tickets, setTickets] = useState<any[]>([]);
    const [selectedTicket, setSelectedTicket] = useState<any | null>(null);
    const [messages, setMessages] = useState<any[]>([]);
    const [reply, setReply] = useState("");
    const [userId, setUserId] = useState<string | null>(null);

    useEffect(() => {
        loadTickets();

        supabase.auth.getUser().then(({ data }) => {
            setUserId(data.user?.id || null);
        });

        // Poll for new tickets every 10s
        const interval = setInterval(loadTickets, 10000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (selectedTicket) {
            loadMessages(selectedTicket.id);
            // Poll for new messages in selected ticket
            const interval = setInterval(() => loadMessages(selectedTicket.id), 3000);
            return () => clearInterval(interval);
        }
    }, [selectedTicket]);

    const loadTickets = async () => {
        const res = await getOpenTickets();
        if (res.success && res.tickets) setTickets(res.tickets);
    };

    const loadMessages = async (ticketId: string) => {
        const res = await getTicketMessages(ticketId);
        if (res.success && res.messages) setMessages(res.messages);
    };

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!reply.trim() || !selectedTicket || !userId) return;

        const content = reply;
        setReply("");

        // Optimistic append
        setMessages(prev => [...prev, {
            id: 'temp-' + Date.now(),
            content,
            sender_type: 'moderator',
            sender_id: userId,
            created_at: new Date().toISOString()
        }]);

        await sendModeratorMessage(selectedTicket.id, userId, content);
        loadMessages(selectedTicket.id);
    };

    const handleClose = async () => {
        if (!selectedTicket) return;
        if (confirm("Are you sure you want to close this ticket?")) {
            await updateTicketStatus(selectedTicket.id, 'closed');
            setSelectedTicket(null);
            loadTickets(); // Refresh list to remove closed ticket
            if (onMessageSent) onMessageSent(); // Trigger parent refresh to update badge
        }
    };

    return (
        <div className="flex h-[calc(100vh-100px)] gap-4 p-4 text-white">
            {/* Ticket List */}
            <div className="w-1/3 bg-gray-800 rounded-xl border border-gray-700 overflow-hidden flex flex-col">
                <div className="p-4 border-b border-gray-700 bg-gray-900">
                    <h2 className="font-bold">Open Tickets ({tickets.length})</h2>
                </div>
                <div className="flex-1 overflow-y-auto">
                    {tickets.length === 0 ? (
                        <p className="p-4 text-gray-400 text-sm">No open tickets.</p>
                    ) : (
                        tickets.map(ticket => (
                            <div
                                key={ticket.id}
                                onClick={() => setSelectedTicket(ticket)}
                                className={`p-4 border-b border-gray-700 cursor-pointer hover:bg-gray-700 transition ${selectedTicket?.id === ticket.id ? 'bg-blue-900/20 border-l-4 border-l-blue-500' : ''}`}
                            >
                                <div className="flex justify-between mb-1">
                                    <span className="font-bold text-sm truncate">{ticket.guest_name}</span>
                                    <span className="text-xs text-gray-500">{new Date(ticket.last_message_at).toLocaleTimeString()}</span>
                                </div>
                                <div className="text-xs text-gray-400 truncate">{ticket.guest_email}</div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Chat View */}
            <div className="flex-1 bg-gray-800 rounded-xl border border-gray-700 overflow-hidden flex flex-col">
                {selectedTicket ? (
                    <>
                        <div className="p-4 border-b border-gray-700 bg-gray-900 flex justify-between items-center">
                            <div>
                                <h3 className="font-bold">{selectedTicket.guest_name}</h3>
                                <p className="text-xs text-gray-400">{selectedTicket.guest_email}</p>
                            </div>
                            <div className="flex gap-3 items-center">
                                <span className="bg-green-900 text-green-300 text-xs px-2 py-1 rounded uppercase">
                                    {selectedTicket.status}
                                </span>
                                <button
                                    onClick={handleClose}
                                    className="bg-red-600/20 hover:bg-red-600 text-red-500 hover:text-white px-3 py-1 rounded-lg text-xs font-bold transition border border-red-900"
                                >
                                    Close Ticket
                                </button>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-900/50">
                            {messages.map(msg => {
                                const isMod = msg.sender_type === 'moderator';
                                return (
                                    <div key={msg.id} className={`flex ${isMod ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[70%] rounded-xl px-4 py-2 text-sm ${isMod
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-gray-700 text-gray-200'
                                            }`}>
                                            {msg.content}
                                            <div className="text-[10px] opacity-50 mt-1">
                                                {new Date(msg.created_at).toLocaleTimeString()}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="p-4 bg-gray-900 border-t border-gray-700">
                            <form onSubmit={handleSend} className="flex gap-2">
                                <input
                                    type="text"
                                    className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white outline-none focus:border-blue-500"
                                    placeholder="Reply to user..."
                                    value={reply}
                                    onChange={(e) => setReply(e.target.value)}
                                />
                                <button
                                    type="submit"
                                    className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-bold"
                                >
                                    Send
                                </button>
                            </form>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center text-gray-500">
                        Select a ticket to view conversation
                    </div>
                )}
            </div>
        </div>
    );
}
