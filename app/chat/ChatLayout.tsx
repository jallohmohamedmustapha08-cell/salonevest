'use client';

import React, { useState, useEffect } from 'react';
import ChatList from '@/components/chat/ChatList';
import ChatWindow from '@/components/chat/ChatWindow';
import { useRouter, useSearchParams } from 'next/navigation';

interface ChatLayoutProps {
    initialConversations: any[];
    currentUserId: string;
    readOnly?: boolean;
}

export default function ChatLayout({ initialConversations, currentUserId, readOnly = false }: ChatLayoutProps) {
    const [selectedId, setSelectedId] = useState<string | undefined>(undefined);
    const [isMobile, setIsMobile] = useState(false);
    const searchParams = useSearchParams();
    const router = useRouter();

    // Handle screen resize for responsive behavior
    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Sync state with URL
    useEffect(() => {
        const id = searchParams.get('id');
        if (id) setSelectedId(id);
    }, [searchParams]);

    const handleSelectConversation = (id: string) => {
        setSelectedId(id);
        // Update URL without full refresh
        const newUrl = new URL(window.location.href);
        newUrl.searchParams.set('id', id);
        window.history.pushState({}, '', newUrl.toString());
    };

    const handleCloseChat = () => {
        setSelectedId(undefined);
        const newUrl = new URL(window.location.href);
        newUrl.searchParams.delete('id');
        window.history.pushState({}, '', newUrl.toString());
    };

    const selectedConversation = initialConversations.find(c => c.id === selectedId);

    // Render logic
    if (isMobile) {
        // Mobile View: Show List OR Window
        if (selectedId && selectedConversation) {
            return (
                <div className="h-[calc(100vh-64px)] w-full">
                    {/* 64px is approx navbar height */}
                    <ChatWindow
                        conversationId={selectedId}
                        currentUserId={currentUserId}
                        participantName={
                            selectedConversation.otherParticipant.business_name ||
                            selectedConversation.otherParticipant.full_name ||
                            'Unknown'
                        }
                        role={selectedConversation.otherParticipant.role}
                        onClose={handleCloseChat}
                        readOnly={readOnly}
                    />
                </div>
            );
        }
        return (
            <div className="h-[calc(100vh-64px)] w-full">
                <ChatList
                    conversations={initialConversations}
                    onSelect={handleSelectConversation}
                    currentUserId={currentUserId}
                />
            </div>
        );
    }

    // Desktop View: Split Screen
    return (
        <div className="flex h-[calc(100vh-64px)] bg-gray-100 mt-0">
            <div className="w-1/3 min-w-[300px] border-r border-gray-200 h-full">
                <ChatList
                    conversations={initialConversations}
                    selectedId={selectedId}
                    onSelect={handleSelectConversation}
                    currentUserId={currentUserId}
                />
            </div>
            <div className="flex-1 h-full">
                {selectedId && selectedConversation ? (
                    <ChatWindow
                        conversationId={selectedId}
                        currentUserId={currentUserId}
                        participantName={
                            selectedConversation.otherParticipant.business_name ||
                            selectedConversation.otherParticipant.full_name ||
                            'Unknown'
                        }
                        role={selectedConversation.otherParticipant.role}
                        readOnly={readOnly}
                    />
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16 mb-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.159 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
                        </svg>
                        <p className="text-lg">Select a conversation to start messaging</p>
                    </div>
                )}
            </div>
        </div>
    );
}
