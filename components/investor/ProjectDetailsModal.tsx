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
}

interface ProjectDetailsModalProps {
    project: Project;
    onClose: () => void;
    onInvest?: (amount: number) => void;
    isInvestLoading?: boolean;
    readOnly?: boolean;
}

export default function ProjectDetailsModal({ project, onClose, onInvest, isInvestLoading, readOnly = false }: ProjectDetailsModalProps) {
    const [reports, setReports] = useState<any[]>([]);
    const [loadingReports, setLoadingReports] = useState(true);
    const [investAmount, setInvestAmount] = useState<number>(100);
    const [activeTab, setActiveTab] = useState<'details' | 'updates'>('details');

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

        fetchReports();
    }, [project.id]);

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 animate-fade-in">
            <div className="bg-gray-800 rounded-xl border border-gray-600 max-w-2xl w-full max-h-[90vh] overflow-y-auto relative flex flex-col">
                {/* Header Image */}
                {project.image_url && (
                    <div className="h-48 w-full relative shrink-0">
                        <img src={project.image_url} alt={project.title} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-gray-800 to-transparent"></div>
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition"
                        >
                            ✕
                        </button>
                    </div>
                )}

                <div className="p-8 pt-4 flex-1">
                    {!project.image_url && (
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 text-gray-400 hover:text-white"
                        >
                            ✕
                        </button>
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
                    </div>

                    {/* Content */}
                    <div className="min-h-[200px]">
                        {activeTab === 'details' ? (
                            <div className="text-gray-300 leading-relaxed text-lg">
                                {project.description}
                            </div>
                        ) : (
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
                        )}
                    </div>

                </div>

                {/* Footer Actions */}
                {!readOnly && (
                    <div className="p-6 border-t border-gray-700 bg-gray-800 sticky bottom-0 z-10 flex flex-col md:flex-row gap-4 items-center justify-between">
                        <div className="w-full md:w-auto">
                            <label className="block text-xs font-bold text-gray-400 mb-1">Investment Amount ($)</label>
                            <input
                                type="number"
                                value={investAmount}
                                onChange={(e) => setInvestAmount(Number(e.target.value))}
                                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                min="10"
                            />
                        </div>
                        <button
                            onClick={() => onInvest && onInvest(investAmount)}
                            disabled={isInvestLoading}
                            className="w-full md:w-auto flex-1 px-8 py-3 rounded-lg bg-green-600 hover:bg-green-700 text-white font-bold shadow-lg shadow-green-900/20 disabled:opacity-50 transition transform hover:scale-105"
                        >
                            {isInvestLoading ? "Processing..." : "Confirm Investment"}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
