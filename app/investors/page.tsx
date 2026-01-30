'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import UserAvatar from '@/components/UserAvatar';

interface InvestorProfile {
    id: string;
    full_name: string;
    business_name: string | null;
    role: string;
    avatar_url: string | null;
    bio?: string;
}

export default function ExploreInvestors() {
    const [investors, setInvestors] = useState<InvestorProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const router = useRouter();

    useEffect(() => {
        const fetchInvestors = async () => {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .in('role', ['investor']);

            if (data) {
                setInvestors(data);
            }
            setLoading(false);
        };

        fetchInvestors();
    }, []);

    const handleConnect = async (investorId: string) => {
        // verifying auth first
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            router.push('/login');
            return;
        }

        try {
            const { createConversation } = await import("@/app/actions/chat");
            const result = await createConversation(investorId);

            if (result.error) {
                alert("Failed to connect: " + result.error);
            } else {
                router.push(`/chat?id=${result.id}`);
            }
        } catch (error) {
            console.error("Error connecting:", error);
            alert("Unexpected error occurred.");
        }
    };

    const filteredInvestors = investors.filter(i =>
        i.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        i.business_name?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-gray-900 font-sans p-4 md:p-8 pb-24 relative">
            <div className="max-w-7xl mx-auto pt-10 md:pt-16">

                {/* Hero Section */}
                <div className="text-center mb-16 space-y-6">
                    <div className="inline-block mb-2">
                        <span className="bg-blue-900/40 text-blue-300 text-xs font-bold px-4 py-1.5 rounded-full border border-blue-500/30 uppercase tracking-wider">
                            Network & Capital
                        </span>
                    </div>
                    <h1 className="text-4xl md:text-6xl font-extrabold text-white tracking-tight">
                        Connect with <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">Top Investors</span>
                    </h1>
                    <p className="text-gray-400 max-w-2xl mx-auto text-lg md:text-xl leading-relaxed">
                        Discover certified investors and funds looking to support the next generation of Sierra Leonean enterprises.
                    </p>

                    {/* Search Bar */}
                    <div className="max-w-xl mx-auto relative mt-8">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <svg className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                        </div>
                        <input
                            type="text"
                            placeholder="Search investors or funds..."
                            className="w-full bg-gray-800/80 backdrop-blur-sm border border-gray-700 text-white text-base rounded-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 block pl-12 p-4 shadow-xl transition placeholder-gray-500"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
                        {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="h-48 bg-gray-800 rounded-2xl border border-gray-700"></div>)}
                    </div>
                ) : filteredInvestors.length === 0 ? (
                    <div className="text-center py-20 bg-gray-800/30 rounded-3xl border border-gray-700/50 max-w-2xl mx-auto">
                        <span className="text-5xl block mb-6">🔍</span>
                        <h3 className="text-2xl font-bold text-white mb-2">No investors found</h3>
                        <p className="text-gray-400">Try adjusting your search criteria or check back later.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredInvestors.map((investor) => (
                            <div key={investor.id} className="bg-gray-800/60 backdrop-blur-md rounded-2xl border border-gray-700 p-6 hover:border-blue-500/50 hover:bg-gray-800 transition duration-300 shadow-lg flex flex-col justify-between group">
                                <div>
                                    <div className="flex justify-between items-start mb-6">
                                        <div className="relative">
                                            <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full opacity-0 group-hover:opacity-75 blur transition duration-500"></div>
                                            <div className="relative">
                                                <UserAvatar url={investor.avatar_url} size={64} fallbackChar={investor.full_name?.charAt(0) || "I"} />
                                            </div>
                                        </div>

                                        <span className="bg-blue-900/40 text-blue-300 text-xs font-bold px-3 py-1 rounded-full border border-blue-500/20 capitalize flex items-center gap-1">
                                            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse"></span>
                                            {investor.role}
                                        </span>
                                    </div>

                                    <h3 className="text-2xl font-bold text-white mb-1 group-hover:text-blue-400 transition">
                                        {investor.business_name || investor.full_name}
                                    </h3>
                                    {investor.business_name && (
                                        <p className="text-sm text-gray-400 mb-2">{investor.full_name}</p>
                                    )}

                                    {investor.bio ? (
                                        <p className="text-gray-400 text-sm line-clamp-3 mb-6 bg-gray-900/50 p-3 rounded-lg border border-gray-700/50 italic">
                                            "{investor.bio}"
                                        </p>
                                    ) : (
                                        <p className="text-gray-500 text-sm italic mb-6">No bio available.</p>
                                    )}

                                    <div className="flex flex-wrap gap-2 mb-6">
                                        <span className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded border border-gray-600">📍 Global / Remote</span>
                                        <span className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded border border-gray-600">💼 Tech & Agri</span>
                                    </div>
                                </div>

                                <button
                                    onClick={() => handleConnect(investor.id)}
                                    className="w-full bg-transparent border border-blue-600/50 text-blue-400 hover:bg-blue-600 hover:text-white font-bold py-3 rounded-xl transition shadow-lg hover:shadow-blue-900/30 flex items-center justify-center gap-2 group-hover:border-blue-500"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                                    Message Investor
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
