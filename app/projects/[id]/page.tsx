"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';

export default function PublicProjectDetails() {
    const { id } = useParams();
    const router = useRouter();
    const [project, setProject] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    // Auth & Investment State
    const [user, setUser] = useState<any>(null);
    const [isInvestor, setIsInvestor] = useState(false);
    const [investAmount, setInvestAmount] = useState<number>(100);
    const [paymentMethod, setPaymentMethod] = useState<'mobile_money' | 'crypto'>('mobile_money');
    const [txHash, setTxHash] = useState("");
    const [isInvestLoading, setIsInvestLoading] = useState(false);
    const [isVerifying, setIsVerifying] = useState(false);

    useEffect(() => {
        const fetchProjectAndUser = async () => {
            // 1. Fetch User Session
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);

            if (user) {
                const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
                if (profile && profile.role === 'investor') {
                    setIsInvestor(true);
                }
            }

            if (!id) return;
            const { data } = await supabase
                .from('projects')
                .select('*')
                .eq('id', id)
                .single();
            if (data) setProject(data);
            setLoading(false);
        };
        fetchProjectAndUser();
    }, [id]);

    const handleInvest = async () => {
        if (!user || !project) return;

        setIsInvestLoading(true);

        // 1. Verify Crypto if needed
        if (paymentMethod === 'crypto') {
            if (!txHash) {
                alert("Please enter the Transaction Hash.");
                setIsInvestLoading(false);
                return;
            }
            setIsVerifying(true);
            const result = await import("@/app/actions/verify-crypto-transaction").then(mod => mod.verifyCryptoTransaction(txHash, investAmount));
            setIsVerifying(false);

            if (result.error) {
                alert("Verification Failed: " + result.error);
                setIsInvestLoading(false);
                return;
            }
            if (!result.success) {
                alert("Verification Failed: Unknown error.");
                setIsInvestLoading(false);
                return;
            }
        }

        // 2. Process Investment
        const result = await import("@/app/actions/invest-in-project").then(mod => mod.makeInvestment(project.id, user.id, investAmount, paymentMethod, paymentMethod === 'crypto' ? txHash : null));

        if (result.success) {
            alert(`Successfully invested $${investAmount} in ${project.title}!`);
            router.push('/dashboard/investor'); // Redirect to dashboard to see investment
        } else {
            alert("Investment failed: " + result.error);
        }
        setIsInvestLoading(false);
    };

    if (loading) return <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">Loading...</div>;
    if (!project) return <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">Project not found.</div>;

    return (
        <div className="min-h-screen bg-gray-900 text-white font-sans pt-24 pb-20">
            <div className="max-w-6xl mx-auto px-6">
                <Link href="/explore" className="text-gray-400 hover:text-white mb-6 inline-block">&larr; Back to Explore</Link>

                <div className="bg-gray-800 rounded-2xl overflow-hidden border border-gray-700 shadow-2xl">
                    <div className="relative h-64 md:h-96 w-full">
                        {project.image_url ? (
                            <img src={project.image_url} alt={project.title} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full bg-gray-700 flex items-center justify-center text-gray-500">No Image</div>
                        )}
                        <div className="absolute top-4 right-4 bg-green-600 text-white px-4 py-1 rounded-full font-bold shadow-lg">
                            Active
                        </div>
                    </div>

                    <div className="p-8">
                        <h1 className="text-3xl md:text-5xl font-bold mb-4">{project.title}</h1>
                        <div className="flex items-center gap-4 text-gray-400 mb-8">
                            <span>📍 {project.location || "Sierra Leone"}</span>
                            <span>📅 Launched {new Date(project.created_at).toLocaleDateString()}</span>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 mb-10">
                            <div className="lg:col-span-2">
                                <h3 className="text-xl font-bold mb-4 text-blue-400">About this Project</h3>
                                <p className="text-gray-300 leading-relaxed text-lg mb-8">{project.description}</p>

                                {/* AI Trust Score Analysis Section */}
                                {project.ai_analysis_result && (
                                    <div className="mt-8 bg-gray-900/50 rounded-xl p-6 border border-gray-700/50 shadow-inner">
                                        <div className="flex items-center justify-between mb-4">
                                            <h3 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-green-400 bg-clip-text text-transparent">
                                                AI Trust & Risk Analysis
                                            </h3>
                                            <div className={`px-4 py-2 rounded-full font-bold text-sm ${(project.trust_score || 0) >= 80 ? 'bg-green-900 text-green-300' :
                                                (project.trust_score || 0) >= 50 ? 'bg-yellow-900 text-yellow-300' :
                                                    'bg-red-900 text-red-300'
                                                }`}>
                                                Trust Score: {project.trust_score}/100
                                            </div>
                                        </div>

                                        <p className="text-gray-300 mb-6 text-sm italic border-l-4 border-blue-500 pl-4 py-2 bg-gray-800/50 rounded-r-lg">
                                            "{project.ai_analysis_result.reasoning}"
                                        </p>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {project.ai_analysis_result.positive_signals && (
                                                <div className="bg-green-900/10 p-4 rounded-lg border border-green-800/30">
                                                    <h4 className="flex items-center gap-2 text-green-400 font-bold mb-3 text-sm">
                                                        <span>✅</span> Positive Signals
                                                    </h4>
                                                    <ul className="space-y-2">
                                                        {project.ai_analysis_result.positive_signals.map((signal: string, i: number) => (
                                                            <li key={i} className="text-gray-400 text-xs flex items-start gap-2">
                                                                <span className="mt-1 block w-1 h-1 bg-green-500 rounded-full shrink-0"></span>
                                                                {signal}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}

                                            {project.ai_analysis_result.risk_factors && (
                                                <div className="bg-red-900/10 p-4 rounded-lg border border-red-800/30">
                                                    <h4 className="flex items-center gap-2 text-red-400 font-bold mb-3 text-sm">
                                                        <span>⚠️</span> Risk Factors
                                                    </h4>
                                                    <ul className="space-y-2">
                                                        {project.ai_analysis_result.risk_factors.map((risk: string, i: number) => (
                                                            <li key={i} className="text-gray-400 text-xs flex items-start gap-2">
                                                                <span className="mt-1 block w-1 h-1 bg-red-500 rounded-full shrink-0"></span>
                                                                {risk}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Investment Sidebar */}
                            <div className="bg-gray-700/30 p-6 rounded-xl border border-gray-600 h-fit sticky top-24">
                                <h3 className="text-xl font-bold mb-4">Funding Status</h3>
                                <div className="mb-2 flex justify-between text-sm">
                                    <span className="text-green-400 font-bold text-lg">${(project.funding || 0).toLocaleString()}</span>
                                    <span className="text-gray-400">of ${(project.goal || 0).toLocaleString()} goal</span>
                                </div>
                                <div className="w-full bg-gray-600 rounded-full h-4 mb-6 overflow-hidden">
                                    <div className="bg-green-500 h-full rounded-full" style={{ width: `${Math.min(((project.funding || 0) / (project.goal || 1)) * 100, 100)}%` }}></div>
                                </div>

                                {/* Conditional Render based on User State */}
                                {!user ? (
                                    <>
                                        <button
                                            onClick={() => router.push(`/login?next=/projects/${id}`)}
                                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl transition shadow-lg shadow-blue-900/20"
                                        >
                                            Login to Invest
                                        </button>
                                        <p className="text-xs text-center mt-3 text-gray-500">You must be a registered investor to back this project.</p>
                                    </>
                                ) : !isInvestor ? (
                                    <div className="p-4 bg-yellow-900/20 border border-yellow-700 rounded-lg text-center">
                                        <p className="text-yellow-200 font-bold mb-2">Investor Account Required</p>
                                        <p className="text-sm text-yellow-100/70">You are logged in, but your account type is not 'Investor'. Only investors can back projects.</p>
                                    </div>
                                ) : (
                                    <div className="animate-fade-in">
                                        <div className="mb-4 pt-4 border-t border-gray-600">
                                            <h4 className="text-sm font-bold text-gray-300 mb-3">Make an Investment</h4>

                                            <label className="block text-xs font-bold text-gray-400 mb-2">Amount ($)</label>
                                            <input
                                                type="number"
                                                value={investAmount}
                                                onChange={(e) => setInvestAmount(Number(e.target.value))}
                                                className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 outline-none mb-4"
                                                min="10"
                                            />

                                            <label className="block text-xs font-bold text-gray-400 mb-2">Payment Method</label>
                                            <div className="flex gap-2 mb-4">
                                                <button
                                                    onClick={() => setPaymentMethod('mobile_money')}
                                                    className={`flex-1 py-2 px-2 rounded-lg border font-bold text-xs transition flex items-center justify-center gap-1 ${paymentMethod === 'mobile_money' ? 'bg-blue-600/20 border-blue-500 text-blue-400' : 'bg-gray-800 border-gray-600 text-gray-400 hover:bg-gray-700'}`}
                                                >
                                                    📱 Mobile Money
                                                </button>
                                                <button
                                                    onClick={() => setPaymentMethod('crypto')}
                                                    className={`flex-1 py-2 px-2 rounded-lg border font-bold text-xs transition flex items-center justify-center gap-1 ${paymentMethod === 'crypto' ? 'bg-purple-600/20 border-purple-500 text-purple-400' : 'bg-gray-800 border-gray-600 text-gray-400 hover:bg-gray-700'}`}
                                                >
                                                    ₿ Crypto
                                                </button>
                                            </div>

                                            {paymentMethod === 'crypto' && (
                                                <div className="mb-4 bg-purple-900/20 p-3 rounded-lg border border-purple-500/30">
                                                    <p className="text-[10px] text-purple-300 mb-1 font-bold">Send USDT/MATIC to:</p>
                                                    <div className="bg-black/40 p-2 rounded border border-purple-500/20 flex items-center justify-between mb-2">
                                                        <code className="text-[10px] text-purple-200 break-all select-all">0x71C7656EC7ab88b098defB751B7401B5f6d8976F</code>
                                                    </div>
                                                    <input
                                                        type="text"
                                                        placeholder="Tx Hash (0x...)"
                                                        value={txHash}
                                                        onChange={(e) => setTxHash(e.target.value)}
                                                        className="w-full bg-gray-900 border border-purple-500/30 rounded px-3 py-2 text-white text-xs focus:border-purple-500 outline-none"
                                                    />
                                                </div>
                                            )}

                                            <button
                                                onClick={handleInvest}
                                                disabled={isInvestLoading || isVerifying}
                                                className={`w-full py-3 rounded-xl text-white font-bold shadow-lg disabled:opacity-50 transition transform hover:scale-105 ${paymentMethod === 'crypto' ? 'bg-purple-600 hover:bg-purple-700 shadow-purple-900/20' : 'bg-green-600 hover:bg-green-700 shadow-green-900/20'}`}
                                            >
                                                {isInvestLoading ? "Processing..." : isVerifying ? "Verifying..." : `Invest $${investAmount}`}
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
