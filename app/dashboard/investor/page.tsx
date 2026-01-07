"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import ProjectDetailsModal from "@/components/investor/ProjectDetailsModal";

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

interface Investment {
    id: string;
    amount: number;
    project: Project;
    created_at: string;
}

export default function InvestorDashboard() {
    const [user, setUser] = useState<any>(null);
    const [activeProjects, setActiveProjects] = useState<Project[]>([]);
    const [myInvestments, setMyInvestments] = useState<Investment[]>([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ totalInvested: 0, projectsFunded: 0 });
    const router = useRouter();

    // Investment Modal State
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);
    const [isInvestLoading, setIsInvestLoading] = useState(false);

    const fetchData = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            router.push("/login");
            return;
        }
        setUser(user);

        // Fetch user's investments
        const { data: investments } = await supabase
            .from('investments')
            .select('*, project:projects(*)')
            .eq('investor_id', user.id)
            .order('created_at', { ascending: false });

        if (investments) {
            setMyInvestments(investments);
            const total = investments.reduce((sum, inv) => sum + Number(inv.amount), 0);
            setStats({
                totalInvested: total,
                projectsFunded: new Set(investments.map(i => i.project_id)).size
            });
        }

        // Fetch Active Projects (Opportunities)
        const { data: projects } = await supabase
            .from('projects')
            .select('*')
            .eq('status', 'Active')
            .order('created_at', { ascending: false });

        if (projects) {
            setActiveProjects(projects);
        }

        setLoading(false);
    };

    useEffect(() => {
        fetchData();
    }, [router]);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.refresh();
        router.push("/login");
    };

    const handleInvest = async (amount: number, paymentMethod: string, txHash?: string | null) => {
        if (!selectedProject || !user) return;
        setIsInvestLoading(true);

        const result = await import("@/app/actions/invest-in-project").then(mod => mod.makeInvestment(selectedProject.id, user.id, amount, paymentMethod, txHash || null));

        if (result.success) {
            alert(`Successfully invested $${amount} in ${selectedProject.title}!`);
            setSelectedProject(null);
            fetchData(); // Refresh data
        } else {
            alert("Investment failed: " + result.error);
        }
        setIsInvestLoading(false);
    };

    if (loading) return <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">Loading...</div>;

    return (
        <div className="min-h-screen bg-gray-900 text-white font-sans">
            {/* Detailed Modal */}
            {selectedProject && (
                <ProjectDetailsModal
                    project={selectedProject}
                    onClose={() => setSelectedProject(null)}
                    onInvest={handleInvest}
                    isInvestLoading={isInvestLoading}
                />
            )}

            <div className="p-8 pb-20 max-w-7xl mx-auto">
                <header className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-green-400">Investor Dashboard</h1>
                        <p className="text-gray-400">Welcome back, {user?.user_metadata?.full_name || user?.email}</p>
                    </div>
                </header>

                {/* Stats Row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-lg">
                        <h2 className="text-gray-400 text-sm font-bold uppercase mb-2">Total Invested</h2>
                        <p className="text-4xl font-bold text-green-400">${stats.totalInvested.toLocaleString()}</p>
                    </div>
                    <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-lg">
                        <h2 className="text-gray-400 text-sm font-bold uppercase mb-2">Projects Funded</h2>
                        <p className="text-4xl font-bold text-blue-400">{stats.projectsFunded}</p>
                    </div>
                    <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-lg">
                        <h2 className="text-gray-400 text-sm font-bold uppercase mb-2">Wallet Balance</h2>
                        <p className="text-4xl font-bold text-gray-300">$50,000</p>
                        <span className="text-xs text-gray-500">(Demo Funds)</span>
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">

                    {/* Opportunities Section */}
                    <div>
                        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                            🚀 Opportunities
                            <span className="text-xs bg-blue-900/50 text-blue-300 px-2 py-1 rounded-full">{activeProjects.length} Active</span>
                        </h2>

                        <div className="space-y-6">
                            {activeProjects.length === 0 ? (
                                <div className="p-10 text-center bg-gray-800/50 rounded-xl border border-gray-700 border-dashed text-gray-500">
                                    No active opportunities at the moment.
                                </div>
                            ) : (
                                activeProjects.map(project => (
                                    <div key={project.id} className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden hover:border-gray-500 transition group">
                                        {project.image_url && (
                                            <div className="h-48 w-full relative">
                                                <img src={project.image_url} alt={project.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                                                <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-white border border-white/10">
                                                    {project.status}
                                                </div>
                                            </div>
                                        )}
                                        <div className="p-6">
                                            <h3 className="text-xl font-bold mb-2">{project.title}</h3>
                                            <p className="text-gray-400 text-sm mb-4 line-clamp-2">{project.description}</p>

                                            <div className="mb-6">
                                                <div className="flex justify-between text-sm mb-2">
                                                    <span className="text-green-400 font-bold">${(project.funding || 0).toLocaleString()} raised</span>
                                                    <span className="text-gray-400">of ${(project.goal || 0).toLocaleString()}</span>
                                                </div>
                                                <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
                                                    <div
                                                        className="bg-green-500 h-full rounded-full transition-all duration-1000"
                                                        style={{ width: `${Math.min(((project.funding || 0) / (project.goal || 1)) * 100, 100)}%` }}
                                                    ></div>
                                                </div>
                                            </div>

                                            <button
                                                onClick={() => setSelectedProject(project)}
                                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition shadow-lg shadow-blue-900/20"
                                            >
                                                View Details & Invest
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* My Portfolio Section */}
                    <div>
                        <h2 className="text-2xl font-bold mb-6">📈 My Portfolio</h2>
                        <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
                            {myInvestments.length === 0 ? (
                                <div className="p-10 text-center text-gray-500">
                                    You haven't made any investments yet.
                                    <p className="text-sm mt-2">Start investing to see your portfolio grow!</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-gray-700">
                                    {myInvestments.map(inv => (
                                        <div key={inv.id} className="p-6 flex justify-between items-center hover:bg-gray-700/30 transition">
                                            <div>
                                                <h4 className="font-bold text-white">{inv.project.title}</h4>
                                                <p className="text-xs text-gray-400">{new Date(inv.created_at).toLocaleDateString()}</p>
                                            </div>
                                            <div className="text-right">
                                                <span className="block text-green-400 font-bold text-lg">+ ${inv.amount.toLocaleString()}</span>
                                                <span className="text-xs bg-green-900/30 text-green-300 px-2 py-0.5 rounded uppercase font-bold">Equity</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
