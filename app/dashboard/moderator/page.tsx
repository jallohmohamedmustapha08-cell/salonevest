"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import Sidebar from "@/components/admin/Sidebar";
import ProjectManagement from "@/components/admin/ProjectManagement";
import VerificationReports from "@/components/admin/VerificationReports";
import MarketplaceManagement from "@/components/admin/MarketplaceManagement";
import AdminProductList from "@/components/admin/AdminProductList";
import MessagesManagement from "@/components/admin/MessagesManagement";
import { getAllConversationsAdmin } from "@/app/actions/chat";
import AgentVerificationLog from "@/components/admin/AgentVerificationLog";
import ModeratorSupport from "@/components/admin/ModeratorSupport";

export default function ModeratorDashboard() {
    const [activeTab, setActiveTab] = useState("projects"); // Default to allowed tab
    const [marketplaceTab, setMarketplaceTab] = useState<'orders' | 'products'>('orders');

    // Data States
    const [projects, setProjects] = useState<any[]>([]);
    const [reports, setReports] = useState<any[]>([]);
    const [verificationLogs, setVerificationLogs] = useState<any[]>([]);
    const [marketplaceOrders, setMarketplaceOrders] = useState<any[]>([]);
    const [marketplaceProducts, setMarketplaceProducts] = useState<any[]>([]);
    const [conversations, setConversations] = useState<any[]>([]);
    const [currentUserId, setCurrentUserId] = useState<string>('');
    const [staff, setStaff] = useState<any[]>([]); // Needed for ProjectManagement filter
    const [supportCount, setSupportCount] = useState(0);
    const [userName, setUserName] = useState<string>(''); // New state
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        setLoading(true);

        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            setCurrentUserId(user.id);
            // Fetch profile name
            const { data: profile } = await supabase.from('profiles').select('full_name').eq('id', user.id).single();
            if (profile) setUserName(profile.full_name || 'Moderator');
        }

        // 1. Fetch Projects
        const { data: projectsData } = await supabase
            .from('projects')
            .select('*, entrepreneur:profiles!entrepreneur_id(full_name)')
            .order('created_at', { ascending: false });

        if (projectsData) {
            const formattedProjects = projectsData.map(p => ({
                ...p,
                farmer: p.entrepreneur?.full_name || 'Unknown',
                score: p.trust_score || 0,
            }));
            setProjects(formattedProjects);
        }

        // 2. Fetch Verification Reports & Logs
        const { data: reportsData } = await supabase
            .from('verification_reports')
            .select(`*, project:projects(title), agent:profiles(full_name)`)
            .order('created_at', { ascending: false });

        if (reportsData) {
            const formattedReports = reportsData.map(r => ({
                id: r.id,
                project_id: r.project_id,
                project_title: r.project?.title || 'Unknown Project',
                agent_name: r.agent?.full_name || 'Unknown Agent',
                report_text: r.report_text,
                image_url: r.image_url,
                status: r.status,
                created_at: r.created_at
            }));
            setReports(formattedReports);
        }

        const { data: logsData } = await supabase
            .from('agent_verifications')
            .select(`*, agent:agent_id(*), verifier:verifier_id(*)`)
            .order('created_at', { ascending: false });

        if (logsData) setVerificationLogs(logsData);

        // 3. Fetch Marketplace
        const { data: ordersData } = await supabase
            .from('marketplace_orders')
            .select(`
                *,
                marketplace_order_items (*, marketplace_products (title)),
                profiles!buyer_id (full_name, email),
                seller:profiles!entrepreneur_id (full_name, business_name)
            `)
            .order('created_at', { ascending: false });

        if (ordersData) setMarketplaceOrders(ordersData);

        const { data: productsData } = await supabase
            .from('marketplace_products')
            .select('*, profiles(full_name, business_name)')
            .is('deleted_at', null)
            .order('created_at', { ascending: false });

        if (productsData) setMarketplaceProducts(productsData);

        // 4. Fetch Conversations
        const { conversations: chats } = await getAllConversationsAdmin(); // RLS fixed for moderators
        if (chats) setConversations(chats);

        // 5. Fetch Staff for Filter usage in ProjectManagement
        const { data: usersData } = await supabase
            .from('profiles')
            .select('*')
            .in('role', ['staff', 'field_agent', 'verifier', 'moderator', 'admin']);
        if (usersData) setStaff(usersData);

        // 6. Fetch Open Support Tickets
        const { getOpenTickets } = await import("@/app/actions/support");
        const supportRes = await getOpenTickets();
        if (supportRes.success && supportRes.tickets) {
            setSupportCount(supportRes.tickets.length);
        }

        setLoading(false);
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Handlers
    const handleApproveProject = async (id: number) => {
        setProjects(projects.map(p => p.id === id ? { ...p, status: 'Active' } : p));
        const result = await import("@/app/actions/update-project-status").then(mod => mod.updateProjectStatus(id, 'Active'));
        if (!result.success) { alert("Error: " + result.error); fetchData(); }
    };

    const handleRejectProject = async (id: number) => {
        if (confirm("Reject this project?")) {
            setProjects(projects.map(p => p.id === id ? { ...p, status: 'Rejected' } : p));
            const result = await import("@/app/actions/update-project-status").then(mod => mod.updateProjectStatus(id, 'Rejected'));
            if (!result.success) { alert("Error: " + result.error); fetchData(); }
        }
    };

    const handleUpdateReportStatus = async (id: string, status: string) => {
        setReports(reports.map(r => r.id === id ? { ...r, status: status } : r));
        const result = await import("@/app/actions/update-verification-status").then(mod => mod.updateVerificationStatus(id, status));
        if (!result.success) { alert("Error: " + result.error); fetchData(); }
    };



    // ...

    const [dismissed, setDismissed] = useState(false);

    return (
        <div className="min-h-screen bg-gray-900 flex font-sans">
            {/* Sidebar with hardcoded moderator role */}
            <Sidebar
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                userRole="moderator"
                userName={userName}
                badges={{ support: supportCount }}
            />

            {supportCount > 0 && activeTab !== 'support' && !dismissed && (
                <div className="fixed top-4 right-4 z-50 bg-red-600 text-white px-6 py-4 rounded-xl shadow-2xl border border-red-500 flex items-center gap-4 animate-bounce-subtle">
                    <span className="text-2xl">🔔</span>
                    <div>
                        <h4 className="font-bold">Action Required</h4>
                        <p className="text-sm">{supportCount} pending support ticket(s).</p>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={() => { setActiveTab('support'); setDismissed(true); }} className="bg-white text-red-600 px-3 py-1 rounded-lg font-bold text-sm hover:bg-gray-100 transition">
                            View
                        </button>
                        <button onClick={() => setDismissed(true)} className="text-white/80 hover:text-white">
                            ✕
                        </button>
                    </div>
                </div>
            )}

            <main className="flex-1 p-8 overflow-y-auto">
                <div className="md:hidden mb-8 flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-white">Moderator Panel</h1>
                    <button className="text-gray-400">Menu</button>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
                    </div>
                ) : (
                    <>
                        {/* Projects Tab */}
                        {activeTab === "projects" && (
                            <ProjectManagement
                                projects={projects}
                                staff={staff}
                                handleApproveProject={handleApproveProject}
                                handleRejectProject={handleRejectProject}
                                onActionComplete={fetchData}
                            />
                        )}

                        {/* Verifications Tab */}
                        {activeTab === "verifications" && (
                            <div className="space-y-12">
                                <AgentVerificationLog logs={verificationLogs} />
                                <div>
                                    <h2 className="text-xl font-bold text-white mb-4">Project Verification Reports</h2>
                                    <VerificationReports reports={reports} handleUpdateStatus={handleUpdateReportStatus} />
                                </div>
                            </div>
                        )}

                        {/* Marketplace Tab */}
                        {activeTab === "marketplace" && (
                            <div>
                                <div className="flex gap-4 mb-6">
                                    <button onClick={() => setMarketplaceTab('orders')} className={`px-4 py-2 rounded-lg font-bold transition ${marketplaceTab === 'orders' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400'}`}>Orders</button>
                                    <button onClick={() => setMarketplaceTab('products')} className={`px-4 py-2 rounded-lg font-bold transition ${marketplaceTab === 'products' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400'}`}>Products</button>
                                </div>
                                {marketplaceTab === 'orders' ? (
                                    <MarketplaceManagement orders={marketplaceOrders} onActionComplete={fetchData} />
                                ) : (
                                    <AdminProductList products={marketplaceProducts} onActionComplete={fetchData} />
                                )}
                            </div>
                        )}

                        {/* Messages Tab */}
                        {activeTab === "messages" && (
                            <MessagesManagement conversations={conversations} currentUserId={currentUserId} />
                        )}

                        {/* Support Tab */}
                        {activeTab === "support" && (
                            <ModeratorSupport />
                        )}
                    </>
                )}
            </main>
        </div>
    );
}
