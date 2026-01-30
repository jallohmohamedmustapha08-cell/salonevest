"use client";

import { useState, useEffect, useRef } from "react";
import { createSupportTicket, sendGuestMessage, getTicketMessages } from "@/app/actions/support";

export default function SupportChatWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [view, setView] = useState<'form' | 'chat'>('form');

    // User Info
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [ticketId, setTicketId] = useState<string | null>(null);

    // Chat State
    const [messages, setMessages] = useState<any[]>([]);
    const [messageInput, setMessageInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [sending, setSending] = useState(false);

    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Load session from local storage
    useEffect(() => {
        const storedTicket = localStorage.getItem('support_ticket_id');
        const storedEmail = localStorage.getItem('support_email');
        if (storedTicket && storedEmail) {
            setTicketId(storedTicket);
            setEmail(storedEmail);
            setView('chat');
        }
    }, []);

    // Polling for messages if chat is open and active
    useEffect(() => {
        let interval: NodeJS.Timeout;

        if (isOpen && view === 'chat' && ticketId) {
            fetchMessages(); // Initial fetch
            interval = setInterval(fetchMessages, 3000); // Poll every 3s
        }

        return () => clearInterval(interval);
    }, [isOpen, view, ticketId]);

    // Scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isOpen]);

    const fetchMessages = async () => {
        if (!ticketId) return;
        const res = await getTicketMessages(ticketId);
        if (res.success && res.messages) {
            const incomingMessages = res.messages;
            // Only update if length changed to avoid jitter (or use better diffing, but simplistic is fine)
            setMessages(prev => {
                if (incomingMessages.length !== prev.length) return incomingMessages;
                return prev;
            });
        }
    };

    const handleStartChat = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const res = await createSupportTicket(name, email);
        if (res.success) {
            setTicketId(res.ticket.id);
            localStorage.setItem('support_ticket_id', res.ticket.id);
            localStorage.setItem('support_email', email);
            setView('chat');
        } else {
            alert("Failed to start chat: " + res.error);
        }
        setLoading(false);
    };

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!messageInput.trim() || !ticketId) return;

        const content = messageInput;
        setMessageInput(""); // Optimistic clear
        setSending(true);

        // Optimistic UI Append
        const tempMsg = {
            id: 'temp-' + Date.now(),
            content: content,
            sender_type: 'guest',
            created_at: new Date().toISOString()
        };
        setMessages(prev => [...prev, tempMsg]);

        const res = await sendGuestMessage(ticketId, content);

        if (!res.success) {
            alert("Failed to send: " + res.error);
            // Remove temp message or handle error
        } else {
            // Replace temp with real (polling will eventually fix it too)
            fetchMessages();
        }
        setSending(false);
    };

    const handleEndChat = () => {
        if (confirm("End this conversation?")) {
            localStorage.removeItem('support_ticket_id');
            localStorage.removeItem('support_email');
            setTicketId(null);
            setMessages([]);
            setView('form');
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 font-sans">
            {/* Toggle Button */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="w-16 h-16 bg-green-600 hover:bg-green-500 rounded-full shadow-2xl flex items-center justify-center text-white transition transform hover:scale-105 animate-bounce-subtle group"
                >
                    <span className="sr-only">Open Support</span>
                    <svg className="w-8 h-8 group-hover:rotate-12 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
                </button>
            )}

            {/* Chat Window */}
            {isOpen && (
                <div className="bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl w-[90vw] md:w-96 flex flex-col max-h-[600px] h-[500px] overflow-hidden animate-fade-in-up">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-green-700 to-emerald-800 p-4 flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-white font-bold">S</div>
                                <span className="absolute bottom-0 right-0 block h-3 w-3 rounded-full ring-2 ring-emerald-800 bg-green-400"></span>
                            </div>
                            <div>
                                <h3 className="font-bold text-white text-sm">SaloneVest Support</h3>
                                <p className="text-white/70 text-xs">Usually replies instantly</p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            {view === 'chat' && (
                                <button onClick={handleEndChat} className="text-white/70 hover:text-white p-1 text-xs uppercase font-bold" title="End Chat">End</button>
                            )}
                            <button onClick={() => setIsOpen(false)} className="text-white/70 hover:text-white p-1">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 bg-gray-800 overflow-y-auto p-4 relative">
                        {view === 'form' ? (
                            <div className="h-full flex flex-col justify-center">
                                <div className="text-center mb-6">
                                    <h4 className="text-xl font-bold text-white mb-2">Hello! 👋</h4>
                                    <p className="text-gray-400 text-sm">Please tell us your name and email so we can help you better.</p>
                                </div>
                                <form onSubmit={handleStartChat} className="space-y-4">
                                    <div>
                                        <label className="block text-gray-400 text-xs font-bold mb-1 ml-1" htmlFor="name">NAME</label>
                                        <input
                                            id="name"
                                            type="text"
                                            required
                                            className="w-full bg-gray-700 border border-gray-600 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-green-500 outline-none transition"
                                            placeholder="John Doe"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-gray-400 text-xs font-bold mb-1 ml-1" htmlFor="email">EMAIL</label>
                                        <input
                                            id="email"
                                            type="email"
                                            required
                                            className="w-full bg-gray-700 border border-gray-600 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-green-500 outline-none transition"
                                            placeholder="john@example.com"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-3 rounded-xl transition shadow-lg mt-2 disabled:opacity-50"
                                    >
                                        {loading ? "Starting..." : "Start Chat"}
                                    </button>
                                    <p className="text-center text-xs text-gray-500 mt-4">
                                        If we aren't online, we'll email you a response.
                                    </p>
                                </form>
                            </div>
                        ) : (
                            <div className="space-y-4 pb-4">
                                <div className="text-center text-xs text-gray-500 my-4">
                                    Chat started. We will reach out to <strong>{email}</strong> if disconnected.
                                </div>

                                {messages.map((msg) => {
                                    const isMe = msg.sender_type === 'guest';
                                    return (
                                        <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                            <div className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm shadow-sm ${isMe
                                                ? 'bg-green-600 text-white rounded-br-none'
                                                : 'bg-gray-700 text-gray-200 rounded-bl-none'
                                                }`}>
                                                {msg.content}
                                            </div>
                                        </div>
                                    );
                                })}
                                <div ref={messagesEndRef} />
                            </div>
                        )}
                    </div>

                    {/* Input Area */}
                    {view === 'chat' && (
                        <div className="p-3 bg-gray-900 border-t border-gray-700">
                            <form onSubmit={handleSend} className="flex gap-2">
                                <input
                                    type="text"
                                    className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-4 py-2 text-white focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none"
                                    placeholder="Type a message..."
                                    value={messageInput}
                                    onChange={(e) => setMessageInput(e.target.value)}
                                // disabled={sending}
                                />
                                <button
                                    type="submit"
                                    disabled={!messageInput.trim() || sending}
                                    className="bg-green-600 hover:bg-green-500 text-white p-2 rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <svg className="w-5 h-5 translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                                </button>
                            </form>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
