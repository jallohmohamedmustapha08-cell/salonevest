'use client';

import React, { useEffect, useRef, useState } from 'react';
import { format } from 'date-fns';
import { sendMessage, getMessages } from '@/app/actions/chat';
import { createClient } from '@/lib/supabaseClient';

interface Message {
    id: string;
    content: string;
    created_at: string;
    sender_id: string;
    sender: {
        full_name?: string;
        business_name?: string;
    };
}

interface ChatWindowProps {
    conversationId: string;
    currentUserId: string;
    participantName: string;
    role?: string;
    onClose?: () => void; // For mobile back view
    readOnly?: boolean;
}

export default function ChatWindow({ conversationId, currentUserId, participantName, role, onClose, readOnly = false }: ChatWindowProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const supabase = createClient();

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        let isMounted = true;

        const loadMessages = async () => {
            setLoading(true);
            const res = await getMessages(conversationId);
            if (isMounted) {
                if (res.messages) {
                    setMessages(res.messages);
                }
                setLoading(false);
                scrollToBottom();
            }
        };

        loadMessages();

        // Real-time subscription
        const channel = supabase
            .channel(`chat:${conversationId}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'messages',
                    filter: `conversation_id=eq.${conversationId}`
                },
                (payload) => {
                    const newMsg = payload.new as Message;
                    // We need to fetch sender info strictly speaking, but for now we might be able to minimal render
                    // or re-fetch. Re-fetching is safer to get relations.
                    // For immediate feedback, we can optimistically append if it's ours, 
                    // but for incoming, we need data.
                    loadMessages(); // Simplest approach for now
                }
            )
            .subscribe();

        return () => {
            isMounted = false;
            supabase.removeChannel(channel);
        };
    }, [conversationId, supabase]);

    const handleSend = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!newMessage.trim() || sending) return;

        setSending(true);
        const tempContent = newMessage;
        setNewMessage(''); // Optimistic clear

        const res = await sendMessage(conversationId, tempContent);

        if (res.error) {
            alert('Failed to send message'); // Simple error handling
            setNewMessage(tempContent);
        } else {
            // Message will arrive via subscription or manual fetch if we wanted
            // But let's confirm fetch:
            // Our subscription handles it, but local append is faster
            // We'll rely on subscription/revalidate for now for simplicity of code
        }
        setSending(false);
    };

    return (
        <div className="flex flex-col h-full bg-[#e5ddd5]/50 relative">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/cubes.png")' }}></div>

            {/* Header */}
            <div className="bg-white px-6 py-3 border-b border-gray-200 flex items-center justify-between sticky top-0 z-10 shadow-sm">
                <div className="flex items-center gap-4">
                    {onClose && (
                        <button onClick={onClose} className="md:hidden text-gray-500 hover:text-gray-700 transition">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                            </svg>
                        </button>
                    )}
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-green-500 to-emerald-600 flex items-center justify-center text-white font-bold text-lg shadow-md">
                            {participantName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-800 leading-tight">{participantName}</h3>
                            {role && <span className="text-xs text-green-600 font-medium bg-green-50 px-2 py-0.5 rounded-full capitalize">{role}</span>}
                        </div>
                    </div>
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 relative z-0">
                {loading ? (
                    <div className="flex justify-center items-center h-full">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                    </div>
                ) : messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center text-gray-400 mt-10">
                        <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-4 text-3xl">👋</div>
                        <p className="font-medium text-gray-600">No messages yet.</p>
                        <p className="text-sm">Start the conversation by sending a message!</p>
                    </div>
                ) : (
                    messages.map((msg, index) => {
                        const isMe = msg.sender_id === currentUserId;
                        const showAvatar = !isMe && (index === 0 || messages[index - 1].sender_id !== msg.sender_id);

                        return (
                            <div key={msg.id} className={`flex w-full ${isMe ? 'justify-end' : 'justify-start'} mb-1`}>
                                {!isMe && (
                                    <div className={`w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-xs font-bold text-gray-600 mr-2 shrink-0 ${showAvatar ? 'opacity-100' : 'opacity-0'}`}>
                                        {msg.sender?.full_name?.charAt(0) || msg.sender?.business_name?.charAt(0) || '?'}
                                    </div>
                                )}
                                <div className={`max-w-[75%] lg:max-w-[60%] px-4 py-2 shadow-sm relative group ${isMe
                                        ? 'bg-[#dcf8c6] text-gray-800 rounded-2xl rounded-tr-sm'
                                        : 'bg-white text-gray-800 rounded-2xl rounded-tl-sm'
                                    }`}>
                                    <p className="whitespace-pre-wrap break-words text-[15px] leading-relaxed">{msg.content}</p>
                                    <div className={`text-[10px] mt-1 text-right flex justify-end items-center gap-1 ${isMe ? 'text-green-800/60' : 'text-gray-400'}`}>
                                        {format(new Date(msg.created_at), 'h:mm a')}
                                        {isMe && (
                                            <span className="text-blue-500">
                                                ✓✓
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            {!readOnly && (
                <div className="bg-white p-3 border-t border-gray-200 sticky bottom-0 z-10 flex items-end gap-2">
                    <form onSubmit={handleSend} className="flex-1 flex gap-2 items-center bg-gray-100 rounded-3xl px-4 py-2 border border-gray-200 focus-within:border-green-500 focus-within:ring-1 focus-within:ring-green-500 transition-all">
                        <textarea
                            value={newMessage}
                            onChange={(e) => {
                                setNewMessage(e.target.value);
                                // Auto-resize height logic could go here
                            }}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSend();
                                }
                            }}
                            placeholder="Type a message..."
                            className="flex-1 bg-transparent border-none focus:ring-0 text-gray-800 placeholder-gray-500 resize-none max-h-32 py-1"
                            rows={1}
                            disabled={sending}
                            style={{ minHeight: '24px' }}
                        />
                    </form>
                    <button
                        onClick={() => handleSend()}
                        disabled={sending || !newMessage.trim()}
                        className={`p-3 rounded-full text-white transition-all duration-200 shadow-md ${sending || !newMessage.trim()
                                ? 'bg-gray-300 cursor-not-allowed'
                                : 'bg-green-600 hover:bg-green-700 active:scale-95'
                            }`}
                    >
                        {sending ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 transform rotate-[-45deg] translate-x-0.5 -translate-y-0.5">
                                <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
                            </svg>
                        )}
                    </button>
                </div>
            )}
        </div>
    );
}
