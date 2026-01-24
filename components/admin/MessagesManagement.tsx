'use client';

import React, { useMemo } from 'react';
import ChatLayout from '@/app/chat/ChatLayout';

interface MessagesManagementProps {
    conversations: any[]; // Raw conversations from DB
    currentUserId: string;
}

// Helper to format names
const getName = (p: any) => p?.business_name || p?.full_name || 'Unknown';

export default function MessagesManagement({ conversations, currentUserId }: MessagesManagementProps) {

    const formattedConversations = useMemo(() => {
        return conversations.map((c: any) => {
            const title = `${getName(c.participant1)} & ${getName(c.participant2)}`;
            return {
                ...c,
                otherParticipant: {
                    id: 'combined',
                    full_name: title,
                    business_name: title,
                    role: 'Conversation'
                }
            };
        });
    }, [conversations]);

    return (
        <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden h-[calc(100vh-140px)]">
            {/* Height calculation to fit within dashboard main area */}
            <ChatLayout
                initialConversations={formattedConversations}
                currentUserId={currentUserId}
                readOnly={true}
            />
        </div>
    );
}
