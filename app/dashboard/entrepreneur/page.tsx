"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import ProjectDetailsModal from "@/components/investor/ProjectDetailsModal";
import GroupApprovals from "@/components/entrepreneur/GroupApprovals";
import MyGroupsList from "@/components/entrepreneur/MyGroupsList";
import EntrepreneurCharts from "@/components/entrepreneur/EntrepreneurCharts";

interface Project {
    id: number;
    title: string;
    description: string;
    funding: number;
    released: number; // New field
    goal: number;
    status: string;
    image_url: string | null;
    created_at: string;
    entrepreneur_id?: string; // Optional since we might not always use it here, but good to have
}

export default function EntrepreneurDashboard() {
    const [user, setUser] = useState<any>(null);
    const [myProjects, setMyProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ totalRaised: 0, totalReleased: 0, activeCampaigns: 0 }); // Added totalReleased
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);
    const router = useRouter();

    const fetchDashboardData = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            router.push("/login");
            return;
        }
        setUser(user);

        // Fetch entrepreneur's projects
        const { data: projects } = await supabase
            .from('projects')
            .select('*')
            .eq('entrepreneur_id', user.id)
            .order('created_at', { ascending: false });

        // Fetch released marketplace orders
        const { data: releasedOrders } = await supabase
            .from('marketplace_orders')
            .select('total_amount')
            .eq('entrepreneur_id', user.id)
            .eq('escrow_status', 'Released');

        if (projects) {
            setMyProjects(projects);

            // Calculate stats
            const raised = projects.reduce((sum, p) => sum + (p.funding || 0), 0);
            const projectReleased = projects.reduce((sum, p) => sum + (p.released || 0), 0);
            const active = projects.filter(p => p.status === 'Active').length;

            const marketplaceReleased = releasedOrders?.reduce((sum, o) => sum + (o.total_amount || 0), 0) || 0;

            setStats({
                totalRaised: raised,
                totalReleased: projectReleased + marketplaceReleased,
                activeCampaigns: active
            });
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchDashboardData();
    }, [router]);

    const handleWithdraw = () => {
        const amount = stats.totalReleased;
        if (amount <= 0) return alert("No released funds available to withdraw. Funds are held in escrow until released by admin.");
        alert(`Initiated withdrawal of $${amount.toLocaleString()} to your Orange Money wallet. (Simulation)`);
    };

    if (loading) return <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">Loading...</div>;

    return (
        <div className="min-h-screen bg-gray-900 text-white font-sans">
            {/* Modal */}
            {selectedProject && (
                <ProjectDetailsModal
                    project={selectedProject}
                    onClose={() => setSelectedProject(null)}
                    readOnly={true}
                    isOwner={true} // Enable owner view
                    onInvest={() => { }}
                    isInvestLoading={false}
                />
            )}

            <div className="p-8 pb-20 max-w-7xl mx-auto">
                <header className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-400">Entrepreneur Dashboard</h1>
                        <p className="text-gray-400">Manage your campaigns and track funding.</p>
                    </div>
                </header>

                {/* Group Approvals Section */}
                <GroupApprovals />

                {/* Stats Row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-lg">
                        <h2 className="text-gray-400 text-sm font-bold uppercase mb-2">Total Funds Raised</h2>
                        <p className="text-4xl font-bold text-green-400">${stats.totalRaised.toLocaleString()}</p>
                        <p className="text-xs text-gray-500 mt-2">Locked in Escrow</p>
                    </div>
                    <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-lg">
                        <h2 className="text-gray-400 text-sm font-bold uppercase mb-2">Active Campaigns</h2>
                        <p className="text-4xl font-bold text-orange-400">{stats.activeCampaigns}</p>
                    </div>
                    <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-lg flex flex-col justify-between">
                        <div>
                            <h2 className="text-gray-400 text-sm font-bold uppercase mb-2">Available for Withdrawal</h2>
                            <p className="text-4xl font-bold text-white">${stats.totalReleased.toLocaleString()}</p>
                            <p className="text-xs text-blue-400 mt-1">Funds released by Admin</p>
                        </div>
                        <button
                            onClick={handleWithdraw}
                            className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded-lg transition"
                        >
                            Withdraw to Mobile Money
                        </button>
                    </div>
                </div>

                {/* Charts */}
                {!loading && myProjects.length > 0 && (
                    <EntrepreneurCharts projects={myProjects} />
                )}

                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold">My Projects</h2>
                    <div className="flex gap-3">
                        <button
                            onClick={() => router.push('/dashboard/entrepreneur/create-group')}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-lg font-bold shadow-lg shadow-blue-900/20 transition transform hover:scale-105"
                        >
                            👥 Create Group
                        </button>
                        <button
                            onClick={() => router.push('/dashboard/entrepreneur/upload')}
                            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-bold shadow-lg shadow-green-900/20 transition transform hover:scale-105"
                        >
                            + Start New Campaign
                        </button>
                    </div>
                </div>

                {/* Marketplace Management Section */}
                <div className="mb-12 bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-lg">
                    <h2 className="text-xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-400">Marketplace Management</h2>
                    <p className="text-gray-400 mb-6">Sell your produce directly to investors and manage your orders.</p>
                    <div className="flex flex-wrap gap-4">
                        <button
                            onClick={() => router.push('/dashboard/entrepreneur/products')}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-lg font-bold shadow-lg shadow-emerald-900/20 transition transform hover:scale-105 flex items-center"
                        >
                            📦 Manage Products
                        </button>
                        <button
                            onClick={() => router.push('/dashboard/entrepreneur/orders')}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-bold shadow-lg shadow-indigo-900/20 transition transform hover:scale-105 flex items-center"
                        >
                            🛒 Manage Orders
                        </button>
                        <button
                            onClick={() => router.push('/marketplace')}
                            className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-bold shadow-lg transition transform hover:scale-105 flex items-center"
                        >
                            🏪 View Marketplace
                        </button>
                    </div>
                </div>

                {/* My Groups Section */}
                <div className="mb-12">
                    <h2 className="text-2xl font-bold mb-4">My Groups</h2>
                    <MyGroupsList userId={user?.id} />
                </div>

                {/* Projects Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {myProjects.length === 0 ? (
                        <div className="col-span-2 p-12 text-center bg-gray-800/50 rounded-xl border border-gray-700 border-dashed">
                            <h3 className="text-xl font-bold text-gray-300 mb-2">No Projects Yet</h3>
                            <p className="text-gray-500 mb-6">Start your journey by creating your first fundraising campaign.</p>
                            <button
                                onClick={() => router.push('/dashboard/entrepreneur/upload')}
                                className="text-green-400 font-bold hover:underline"
                            >
                                Create a Project Now &rarr;
                            </button>
                        </div>
                    ) : (
                        myProjects.map(project => (
                            <div
                                key={project.id}
                                onClick={() => setSelectedProject(project)}
                                className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden hover:border-gray-600 transition cursor-pointer"
                            >
                                <div className="flex h-full">
                                    {/* Image (Desktop only mostly) */}
                                    <div className="hidden sm:block w-1/3 relative">
                                        {project.image_url ? (
                                            <img src={project.image_url} alt={project.title} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full bg-gray-700 flex items-center justify-center text-gray-500">No Image</div>
                                        )}
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 p-6 flex flex-col justify-between">
                                        <div>
                                            <div className="flex justify-between items-start mb-2">
                                                <h3 className="text-xl font-bold text-white line-clamp-1">{project.title}</h3>
                                                <span className={`px-2 py-1 text-xs rounded font-bold uppercase ${project.status === 'Active' ? 'bg-green-900/30 text-green-400' :
                                                    project.status === 'Rejected' ? 'bg-red-900/30 text-red-400' :
                                                        'bg-yellow-900/30 text-yellow-400'
                                                    }`}>
                                                    {project.status}
                                                </span>
                                            </div>
                                            <p className="text-gray-400 text-sm mb-4 line-clamp-2">{project.description}</p>
                                        </div>

                                        <div>
                                            <div className="flex justify-between text-sm mb-1">
                                                <span className="text-white font-bold">${(project.funding || 0).toLocaleString()}</span>
                                                <span className="text-gray-500">Goal: ${(project.goal || 0).toLocaleString()}</span>
                                            </div>
                                            <div className="flex justify-between text-xs text-blue-400 mb-2">
                                                <span>Unlocked: ${(project.released || 0).toLocaleString()}</span>
                                            </div>
                                            <div className="w-full bg-gray-700 rounded-full h-2 mb-4">
                                                <div
                                                    className="bg-green-500 h-full rounded-full"
                                                    style={{ width: `${Math.min(((project.funding || 0) / (project.goal || 1)) * 100, 100)}%` }}
                                                ></div>
                                            </div>
                                            <p className="text-xs text-gray-500">Created: {new Date(project.created_at).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
