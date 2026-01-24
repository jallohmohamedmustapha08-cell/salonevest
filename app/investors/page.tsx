'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';

interface InvestorProfile {
    id: string;
    full_name: string;
    business_name: string | null;
    role: string;
    avatar_url: string | null;
    // We might not have 'interests' or 'minCheck' in the DB yet, so we'll mock or omit only if strictly needed.
    // For now, let's assume we just show basic info.
}

export default function ExploreInvestors() {
    const [investors, setInvestors] = useState<InvestorProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const fetchInvestors = async () => {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .in('role', ['investor']); // Adjust if you have 'certified_investor' role or keep it simple

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
            // Dynamically import to avoid server-action issues in client component if needed, 
            // though usually safe to import at top if "use client"
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

    return (
        <div className="min-h-screen bg-gray-900 p-4 md:p-8 pb-20">
            <div className="max-w-6xl mx-auto">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-white mb-4">Find Investors</h1>
                    <p className="text-gray-400 max-w-2xl mx-auto">
                        Connect with certified investors and funds looking to support Sierra Leonean enterprises.
                    </p>
                </div>

                {loading ? (
                    <div className="flex justify-center text-white">Loading investors...</div>
                ) : investors.length === 0 ? (
                    <div className="text-center text-gray-500">No investors found yet.</div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {investors.map((investor) => (
                            <div key={investor.id} className="bg-gray-800 rounded-xl border border-gray-700 p-6 hover:border-blue-500 transition shadow-lg flex flex-col justify-between">
                                <div>
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="bg-blue-900/30 w-12 h-12 rounded-full flex items-center justify-center text-2xl font-bold text-blue-400">
                                            {investor.business_name?.charAt(0) || investor.full_name?.charAt(0) || "I"}
                                        </div>
                                        <span className="bg-blue-900 text-blue-300 text-xs px-2 py-1 rounded-full border border-blue-700 flex items-center gap-1 capitalize">
                                            {investor.role}
                                        </span>
                                    </div>

                                    <h3 className="text-xl font-bold text-white mb-2">
                                        {investor.business_name || investor.full_name}
                                    </h3>
                                    <p className="text-gray-400 text-sm mb-4 flex items-center gap-1">
                                        {/* Location placeholder if not in DB */}
                                        📍 Sierra Leone / International
                                    </p>
                                </div>

                                <button
                                    onClick={() => handleConnect(investor.id)}
                                    className="w-full mt-4 bg-transparent border border-blue-600 text-blue-400 hover:bg-blue-600 hover:text-white font-bold py-2 rounded-lg transition"
                                >
                                    Connect
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
