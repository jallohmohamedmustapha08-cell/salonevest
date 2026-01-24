'use client';

import React, { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';

interface Participant {
    id: string;
    full_name?: string;
    business_name?: string;
    role: string;
}

interface Conversation {
    id: string;
    last_message_preview: string;
    last_message_time: string;
    participant1_id: string;
    participant2_id: string;
    otherParticipant: Participant;
}

interface ChatListProps {
    conversations: Conversation[];
    selectedId?: string;
    onSelect: (id: string) => void;
    currentUserId: string;
}

export default function ChatList({ conversations, selectedId, onSelect, currentUserId }: ChatListProps) {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredConversations = conversations.filter(conv => {
        const name = conv.otherParticipant.business_name || conv.otherParticipant.full_name || 'Unknown';
        return name.toLowerCase().includes(searchTerm.toLowerCase());
    });

    return (
        <div className="flex flex-col h-full bg-white border-r">
            <div className="p-4 border-b">
                <h2 className="text-xl font-bold mb-4">Messages</h2>
                <input
                    type="text"
                    placeholder="Search messages..."
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            <div className="flex-1 overflow-y-auto">
                {filteredConversations.length === 0 ? (
                    <div className="p-4 text-center text-gray-500">No conversations found</div>
                ) : (
                    filteredConversations.map((conv) => {
                        const name = conv.otherParticipant.business_name || conv.otherParticipant.full_name || 'Unknown';
                        const role = conv.otherParticipant.role;
                        const isSelected = selectedId === conv.id;

                        return (
                            <div
                                key={conv.id}
                                onClick={() => onSelect(conv.id)}
                                className={`p-4 border-b cursor-pointer hover:bg-gray-50 transition-colors ${isSelected ? 'bg-green-50 border-l-4 border-l-green-600' : ''}`}
                            >
                                <div className="flex justify-between items-start mb-1">
                                    <h3 className="font-semibold text-gray-800 truncate">{name}</h3>
                                    {conv.last_message_time && (
                                        <span className="text-xs text-gray-400 whitespace-nowrap ml-2">
                                            {formatDistanceToNow(new Date(conv.last_message_time), { addSuffix: true })}
                                        </span>
                                    )}
                                </div>
                                <div className="flex justify-between items-center">
                                    <p className="text-sm text-gray-500 truncate w-3/4">
                                        {conv.last_message_preview || 'No messages yet'}
                                    </p>
                                    <span className={`text-xs px-2 py-0.5 rounded-full ${role === 'investor' ? 'bg-blue-100 text-blue-800' :
                                            role === 'entrepreneur' ? 'bg-green-100 text-green-800' :
                                                'bg-gray-100 text-gray-800'
                                        }`}>
                                        {role}
                                    </span>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
