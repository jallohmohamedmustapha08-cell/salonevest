"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

interface Project {
    id: number;
    title: string;
    description: string;
    funding: number;
    goal: number;
    image_url: string | null;
    status: string;
    location?: string;
    entrepreneur_id?: string;
}

interface ProjectDetailsModalProps {
    project: Project;
    onClose: () => void;
    onInvest?: (amount: number, paymentMethod: string, txHash?: string | null) => void;
    isInvestLoading?: boolean;
    readOnly?: boolean;
    isOwner?: boolean; // New prop for Entrepreneur view
}

export default function ProjectDetailsModal({ project, onClose, onInvest, isInvestLoading, readOnly = false, isOwner = false }: ProjectDetailsModalProps) {
    const [reports, setReports] = useState<any[]>([]);
    const [investors, setInvestors] = useState<any[]>([]); // New State
    const [loadingReports, setLoadingReports] = useState(true);
    const [loadingInvestors, setLoadingInvestors] = useState(false); // New State
    const [investAmount, setInvestAmount] = useState<number>(100);
    const [activeTab, setActiveTab] = useState<'details' | 'updates' | 'investors'>('details');

    const [paymentMethod, setPaymentMethod] = useState<'mobile_money' | 'crypto'>('mobile_money');
    const [txHash, setTxHash] = useState("");
    const [isVerifying, setIsVerifying] = useState(false);

    // Router for chat
    const { useRouter } = require("next/navigation");
    const router = useRouter();

    useEffect(() => {
        const fetchReports = async () => {
            const { data } = await supabase
                .from('verification_reports')
                .select('*')
                .eq('project_id', project.id)
                .eq('status', 'Verified') // Only show verified reports
                .order('created_at', { ascending: false });

            if (data) setReports(data);
            setLoadingReports(false);
        };

        const fetchInvestors = async () => {
            if (!isOwner) return;
            setLoadingInvestors(true);
            // Fetch unique investors for this project
            // We want to link to profiles to get names
            const { data } = await supabase
                .from('investments')
                .select('investor_id, profiles:investor_id(full_name, email, role, id)')
                .eq('project_id', project.id);

            if (data) {
                // De-duplicate investors
                const uniqueInvestors = Array.from(new Map(data.map(item => [item.investor_id, item.profiles])).values());
                setInvestors(uniqueInvestors);
            }
            setLoadingInvestors(false);
        };

        fetchReports();
        fetchInvestors();
    }, [project.id, isOwner]);

    const handleInvestClick = async () => {
        if (!onInvest) return;

        if (paymentMethod === 'crypto') {
            if (!txHash) {
                alert("Please enter the Transaction Hash.");
                return;
            }
            setIsVerifying(true);
            const result = await import("@/app/actions/verify-crypto-transaction").then(mod => mod.verifyCryptoTransaction(txHash, investAmount));
            setIsVerifying(false);

            if (result.error) {
                alert("Verification Failed: " + result.error);
                return;
            }
            if (!result.success) {
                alert("Verification Failed: Unknown error.");
                return;
            }
            // Success
            onInvest(investAmount, 'crypto', txHash);

        } else {
            // Mobile Money - Simulation always success for now
            onInvest(investAmount, 'mobile_money', null);
        }
    };

    const handleMessageEntrepreneur = async () => {
        if (!project.entrepreneur_id) return;
        startChat(project.entrepreneur_id);
    };

    const handleMessageInvestor = async (investorId: string) => {
        startChat(investorId);
    };

    const startChat = async (userId: string) => {
        try {
            const { createConversation } = await import("@/app/actions/chat");
            const result = await createConversation(userId);
            if (result.error) {
                alert("Failed to start chat: " + result.error);
            } else {
                router.push(`/chat?id=${result.id}`);
            }
        } catch (error) {
            console.error("Error starting chat:", error);
            alert("Error starting chat");
        }
    }

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 animate-fade-in">
            <div className="bg-gray-800 rounded-xl border border-gray-600 max-w-2xl w-full max-h-[90vh] overflow-y-auto relative flex flex-col">
                {/* Header Image */}
                {project.image_url && (
                    <div className="h-48 w-full relative shrink-0">
                        <img src={project.image_url} alt={project.title} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-gray-800 to-transparent"></div>
                        <div className="absolute top-4 right-4 flex gap-2">
                            <button
                                onClick={handleMessageEntrepreneur}
                                className="bg-blue-600/90 hover:bg-blue-600 text-white rounded-full p-2 px-4 text-sm font-bold transition flex items-center gap-1"
                            >
                                💬 Message
                            </button>
                            <button
                                onClick={onClose}
                                className="bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition"
                            >
                                ✕
                            </button>
                        </div>
                    </div>
                )}

                <div className="p-8 pt-4 flex-1">
                    {!project.image_url && (
                        <div className="absolute top-4 right-4 flex gap-2">
                            <button
                                onClick={handleMessageEntrepreneur}
                                className="bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 rounded-full px-4 py-1 text-sm font-bold transition flex items-center gap-1 border border-blue-600/30"
                            >
                                💬 Message
                            </button>
                            <button
                                onClick={onClose}
                                className="text-gray-400 hover:text-white"
                            >
                                ✕
                            </button>
                        </div>
                    )}

                    <h2 className="text-3xl font-bold text-white mb-2">{project.title}</h2>
                    <div className="flex items-center gap-4 text-sm text-gray-400 mb-6">
                        <span>📍 {project.location || "Sierra Leone"}</span>
                        <span>🎯 Goal: ${project.goal.toLocaleString()}</span>
                    </div>

                    {/* Funding Progress */}
                    <div className="mb-8 bg-gray-700/30 p-4 rounded-lg border border-gray-700">
                        <div className="flex justify-between text-sm mb-2">
                            <span className="text-green-400 font-bold">${(project.funding || 0).toLocaleString()} raised</span>
                            <span className="text-gray-400">{Math.round(((project.funding || 0) / (project.goal || 1)) * 100)}% Funded</span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
                            <div
                                className="bg-green-500 h-full rounded-full"
                                style={{ width: `${Math.min(((project.funding || 0) / (project.goal || 1)) * 100, 100)}%` }}
                            ></div>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="flex border-b border-gray-700 mb-6">
                        <button
                            onClick={() => setActiveTab('details')}
                            className={`px-6 py-3 font-bold text-sm transition border-b-2 ${activeTab === 'details' ? 'border-blue-500 text-white' : 'border-transparent text-gray-400 hover:text-white'}`}
                        >
                            Project Details
                        </button>
                        <button
                            onClick={() => setActiveTab('updates')}
                            className={`px-6 py-3 font-bold text-sm transition border-b-2 flex items-center gap-2 ${activeTab === 'updates' ? 'border-blue-500 text-white' : 'border-transparent text-gray-400 hover:text-white'}`}
                        >
                            Field Reports
                            <span className="bg-gray-700 text-xs px-2 py-0.5 rounded-full">{reports.length}</span>
                        </button>
                        {isOwner && (
                            <button
                                onClick={() => setActiveTab('investors')}
                                className={`px-6 py-3 font-bold text-sm transition border-b-2 flex items-center gap-2 ${activeTab === 'investors' ? 'border-blue-500 text-white' : 'border-transparent text-gray-400 hover:text-white'}`}
                            >
                                Investors
                                <span className="bg-gray-700 text-xs px-2 py-0.5 rounded-full">{investors.length}</span>
                            </button>
                        )}
                    </div>

                    {/* Content */}
                    <div className="min-h-[150px]">
                        {activeTab === 'details' ? (
                            <div className="text-gray-300 leading-relaxed text-lg">
                                {project.description}
                            </div>
                        ) : activeTab === 'updates' ? (
                            <div className="space-y-4">
                                {loadingReports ? (
                                    <div className="text-center text-gray-500 py-4">Loading updates...</div>
                                ) : reports.length === 0 ? (
                                    <div className="text-center py-8 bg-gray-700/30 rounded-lg border border-gray-700 border-dashed">
                                        <p className="text-gray-400">No field verification reports yet.</p>
                                    </div>
                                ) : (
                                    reports.map(report => (
                                        <div key={report.id} className="bg-gray-700/50 p-4 rounded-lg border border-gray-600">
                                            <div className="flex justify-between items-start mb-2">
                                                <span className="text-green-400 text-xs font-bold uppercase border border-green-900 bg-green-900/20 px-2 py-1 rounded">Verified Update</span>
                                                <span className="text-gray-500 text-xs">{new Date(report.created_at).toLocaleDateString()}</span>
                                            </div>
                                            <p className="text-gray-300 text-sm mb-3">"{report.report_text}"</p>
                                            {report.image_url && (
                                                <img src={report.image_url} alt="Evidence" className="w-full h-48 object-cover rounded-lg border border-gray-600" />
                                            )}
                                        </div>
                                    ))
                                )}
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {loadingInvestors ? (
                                    <div className="text-center text-gray-500 py-4">Loading investors...</div>
                                ) : investors.length === 0 ? (
                                    <div className="text-center py-8 bg-gray-700/30 rounded-lg border border-gray-700 border-dashed">
                                        <p className="text-gray-400">No investors yet.</p>
                                    </div>
                                ) : (
                                    investors.map((inv: any) => (
                                        <div key={inv.id} className="bg-gray-700/50 p-4 rounded-lg border border-gray-600 flex justify-between items-center transition hover:bg-gray-700">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
                                                    {inv.full_name?.charAt(0) || '?'}
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-white">{inv.full_name || "Anonymous Investor"}</h4>
                                                    <p className="text-xs text-gray-400">{inv.role || 'Investor'}</p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleMessageInvestor(inv.id)}
                                                className="bg-blue-600/20 hover:bg-blue-600 text-blue-400 hover:text-white px-4 py-2 rounded-lg text-sm font-bold transition flex items-center gap-2"
                                            >
                                                💬 Message
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}
                    </div>

                </div>

                {/* Footer Actions */}
                {!readOnly && (
                    <div className="p-6 border-t border-gray-700 bg-gray-800 sticky bottom-0 z-10">
                        <div className="mb-4">
                            <label className="block text-xs font-bold text-gray-400 mb-2">Payment Method</label>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setPaymentMethod('mobile_money')}
                                    className={`flex-1 py-3 px-4 rounded-lg border font-bold text-sm transition flex items-center justify-center gap-2 ${paymentMethod === 'mobile_money' ? 'bg-blue-600/20 border-blue-500 text-blue-400' : 'bg-gray-700 border-gray-600 text-gray-400 hover:bg-gray-600'}`}
                                >
                                    📱 Mobile Money
                                </button>
                                <button
                                    onClick={() => setPaymentMethod('crypto')}
                                    className={`flex-1 py-3 px-4 rounded-lg border font-bold text-sm transition flex items-center justify-center gap-2 ${paymentMethod === 'crypto' ? 'bg-purple-600/20 border-purple-500 text-purple-400' : 'bg-gray-700 border-gray-600 text-gray-400 hover:bg-gray-600'}`}
                                >
                                    ₿ Crypto (Polygon)
                                </button>
                            </div>
                        </div>

                        {paymentMethod === 'crypto' && (
                            <div className="mb-4 bg-purple-900/20 p-4 rounded-lg border border-purple-500/30">
                                <p className="text-xs text-purple-300 mb-2 font-bold">1. Send USDT/MATIC (Polygon) to:</p>
                                <div className="bg-black/40 p-2 rounded border border-purple-500/20 flex items-center justify-between mb-4">
                                    <code className="text-xs text-purple-200 break-all select-all">0x71C7656EC7ab88b098defB751B7401B5f6d8976F</code>
                                    <button onClick={() => navigator.clipboard.writeText("0x71C7656EC7ab88b098defB751B7401B5f6d8976F")} className="text-xs text-purple-400 hover:text-white font-bold px-2">Copy</button>
                                </div>
                                <p className="text-xs text-purple-300 mb-2 font-bold">2. Enter Transaction Hash:</p>
                                <input
                                    type="text"
                                    placeholder="0x..."
                                    value={txHash}
                                    onChange={(e) => setTxHash(e.target.value)}
                                    className="w-full bg-gray-900 border border-purple-500/30 rounded px-3 py-2 text-white text-xs focus:border-purple-500 outline-none"
                                />
                            </div>
                        )}

                        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                            <div className="w-full md:w-auto">
                                <label className="block text-xs font-bold text-gray-400 mb-1">Amount ($)</label>
                                <input
                                    type="number"
                                    value={investAmount}
                                    onChange={(e) => setInvestAmount(Number(e.target.value))}
                                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                    min="10"
                                />
                            </div>
                            <button
                                onClick={handleInvestClick}
                                disabled={isInvestLoading || isVerifying}
                                className={`w-full md:w-auto flex-1 px-8 py-3 rounded-lg text-white font-bold shadow-lg disabled:opacity-50 transition transform hover:scale-105 ${paymentMethod === 'crypto' ? 'bg-purple-600 hover:bg-purple-700 shadow-purple-900/20' : 'bg-green-600 hover:bg-green-700 shadow-green-900/20'}`}
                            >
                                {isInvestLoading ? "Processing..." : isVerifying ? "Verifying On-Chain..." : "Confirm Investment"}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
