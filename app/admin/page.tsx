"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import Sidebar from "@/components/admin/Sidebar";
import Overview from "@/components/admin/Overview";
import UserManagement from "@/components/admin/UserManagement";
import StaffManagement from "@/components/admin/StaffManagement";
import ProjectManagement from "@/components/admin/ProjectManagement";
import VerificationReports from "@/components/admin/VerificationReports";

export default function AdminDashboard() {
    const [activeTab, setActiveTab] = useState("overview");
    const [showAddStaff, setShowAddStaff] = useState(false);
    const [users, setUsers] = useState<any[]>([]);
    const [projects, setProjects] = useState<any[]>([]);
    const [reports, setReports] = useState<any[]>([]); // New State
    const [loading, setLoading] = useState(true);

    // Stats
    const stats = [
        { label: "Total Users", value: users.length.toString(), change: "+12%" },
        { label: "Active Projects", value: projects.filter(p => p.status === 'Active').length.toString(), change: "+5" },
        { label: "Pending Reports", value: reports.filter(r => r.status === 'Submitted').length.toString(), change: reports.filter(r => r.status === 'Submitted').length > 0 ? "Action Needed" : "All Clear" },
        { label: "Pending Verifications", value: projects.filter(p => p.status === 'Pending').length.toString(), change: "-2" },
    ];

    const [staff, setStaff] = useState<any[]>([]);

    const fetchData = async () => {
        setLoading(true);

        // Fetch Users (Profiles)
        const { data: usersData } = await supabase
            .from('profiles')
            .select('*')
            .order('created_at', { ascending: false });

        if (usersData) {
            // Map to match User interface
            const mappedUsers = usersData.map(u => ({
                id: u.id,
                name: u.full_name || u.email, // Fallback
                email: u.email,
                role: u.role,
                status: u.status,
                type: u.type
            }));
            setUsers(mappedUsers);

            // Filter for staff roles
            const staffMembers = usersData.filter(user =>
                ['staff', 'field_agent', 'verifier', 'moderator', 'admin'].includes(user.role)
            );
            setStaff(staffMembers);
        }

        // Fetch Projects
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

        // Fetch Verification Reports
        const { data: reportsData } = await supabase
            .from('verification_reports')
            .select(`
                *,
                project:projects(title),
                agent:profiles(full_name)
            `)
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

        setLoading(false);
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleUpgradeUser = async (id: string) => {
        // Optimistic Update
        setUsers(users.map(u => u.id === id ? { ...u, type: 'Certified' } : u));

        const result = await import("@/app/actions/update-user-status").then(mod => mod.updateUserStatus(id, { type: 'Certified' }));
        if (result.success) {
            // alert("User verified successfully."); // Optional, maybe too noisy?
            fetchData();
        } else {
            alert("Error: " + result.error);
            fetchData(); // Revert
        }
    };

    const handleBanUser = async (id: string) => {
        if (confirm("Are you sure you want to ban this user?")) {
            // Optimistic
            setUsers(users.map(u => u.id === id ? { ...u, status: 'Banned' } : u));

            const result = await import("@/app/actions/update-user-status").then(mod => mod.updateUserStatus(id, { status: 'Banned' }));
            if (result.success) {
                // alert("User banned.");
                fetchData();
            } else {
                alert("Error: " + result.error);
                fetchData();
            }
        }
    };

    const handleDeleteUser = async (id: string) => {
        if (confirm("Are you sure you want to PERMANENTLY delete this user?")) {
            // Optimistic
            setUsers(users.filter(u => u.id !== id));

            const result = await import("@/app/actions/delete-user").then(mod => mod.deleteUser(id));
            if (result.success) {
                fetchData();
            } else {
                alert("Error deleting user: " + result.error);
                fetchData();
            }
        }
    };

    const handleDeleteStaff = async (id: string) => {
        if (confirm("Are you sure you want to remove this staff member?")) {
            // Optimistic
            setStaff(staff.filter(s => s.id !== id));
            // Also remove from users list if present there
            setUsers(users.filter(u => u.id !== id));

            const result = await import("@/app/actions/delete-user").then(mod => mod.deleteUser(id));
            if (result.success) {
                fetchData();
            } else {
                alert("Error: " + result.error);
                fetchData();
            }
        }
    };

    const handleApproveProject = async (id: number) => {
        // Optimistic
        setProjects(projects.map(p => p.id === id ? { ...p, status: 'Active' } : p));

        const result = await import("@/app/actions/update-project-status").then(mod => mod.updateProjectStatus(id, 'Active'));
        if (result.success) {
            // alert("Project approved!");
            fetchData();
        } else {
            alert("Error: " + result.error);
            fetchData();
        }
    };

    const handleRejectProject = async (id: number) => {
        if (confirm("Reject this project?")) {
            // Optimistic
            setProjects(projects.map(p => p.id === id ? { ...p, status: 'Rejected' } : p));

            const result = await import("@/app/actions/update-project-status").then(mod => mod.updateProjectStatus(id, 'Rejected'));
            if (result.success) {
                // alert("Project rejected.");
                fetchData();
            } else {
                alert("Error: " + result.error);
                fetchData();
            }
        }
    };

    const handleUpdateReportStatus = async (id: string, status: string) => {
        // Optimistic
        setReports(reports.map(r => r.id === id ? { ...r, status: status } : r));

        const result = await import("@/app/actions/update-verification-status").then(mod => mod.updateVerificationStatus(id, status));
        if (result.success) {
            fetchData();
        } else {
            alert("Error updating report: " + result.error);
            fetchData();
        }
    };


    return (
        <div className="min-h-screen bg-gray-900 flex font-sans">
            {/* Sidebar */}
            <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

            {/* Main Content */}
            <main className="flex-1 p-8 overflow-y-auto">
                {/* Mobile Header */}
                <div className="md:hidden mb-8 flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-white">Admin Panel</h1>
                    <button className="text-gray-400">Menu</button>
                </div>

                {activeTab === "overview" && <Overview stats={stats} />}

                {/* Users Tab */}
                {activeTab === "users" && (
                    <UserManagement
                        users={users}
                        handleUpgradeUser={handleUpgradeUser}
                        handleBanUser={handleBanUser}
                        handleDeleteUser={handleDeleteUser}
                        onActionComplete={fetchData}
                    />
                )}

                {/* Staff Tab */}
                {activeTab === "staff" && (
                    <StaffManagement
                        staff={staff}
                        showAddStaff={showAddStaff}
                        setShowAddStaff={setShowAddStaff}
                        handleDeleteStaff={handleDeleteStaff}
                        onActionComplete={fetchData}
                    />
                )}

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
                    <VerificationReports
                        reports={reports}
                        handleUpdateStatus={handleUpdateReportStatus}
                    />
                )}

                {activeTab === "settings" && (
                    <div className="space-y-6">
                        <h2 className="text-3xl font-bold text-white">Platform Settings</h2>
                        <div className="bg-gray-800 p-8 rounded-xl border border-gray-700 max-w-2xl">
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-gray-400 mb-2">Platform Fee (%)</label>
                                    <input type="number" defaultValue="2.5" className="w-full bg-gray-700 border border-gray-600 text-white px-4 py-3 rounded-lg" />
                                </div>
                                <div>
                                    <label className="block text-gray-400 mb-2">Minimum Investment Amount ($)</label>
                                    <input type="number" defaultValue="50" className="w-full bg-gray-700 border border-gray-600 text-white px-4 py-3 rounded-lg" />
                                </div>
                                <div className="flex items-center gap-3">
                                    <input type="checkbox" id="maintenance" className="w-5 h-5 rounded bg-gray-700 border-gray-600" />
                                    <label htmlFor="maintenance" className="text-white">Enable Maintenance Mode</label>
                                </div>
                                <button onClick={() => alert("Settings saved successfully! (Note: These are currently local only)")} className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-bold">Save Changes</button>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
