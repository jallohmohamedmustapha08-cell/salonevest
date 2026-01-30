"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import UserAvatar from "@/components/UserAvatar";

interface Project {
    id: number;
    title: string;
    description: string;
    location: string;
    assigned_staff_id: string;
}

export default function StaffDashboard() {
    const [user, setUser] = useState<any>(null);
    const [role, setRole] = useState<string | null>(null);
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
    const [assignedProjects, setAssignedProjects] = useState<Project[]>([]);
    const router = useRouter();

    // Verification Modal State (Project)
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);
    const [reportText, setReportText] = useState("");
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Agent Verification State
    const [pendingAgents, setPendingAgents] = useState<any[]>([]);
    const [selectedAgent, setSelectedAgent] = useState<any | null>(null);
    const [verificationComment, setVerificationComment] = useState("");
    const [agentImageFile, setAgentImageFile] = useState<File | null>(null);
    const [myPastVerifications, setMyPastVerifications] = useState<any[]>([]); // New State

    const fetchData = async (userId: string, userRole: string) => {
        console.log("Fetching data for:", userId, "Role:", userRole);

        // If Field Agent, fetch assigned projects
        if (userRole === 'field_agent') {
            const { data: projects, error: projError } = await supabase
                .from('projects')
                .select('*')
                .eq('assigned_staff_id', userId);

            if (projError) console.error("Error fetching projects:", projError);
            console.log("Assigned Projects:", projects);

            if (projects) setAssignedProjects(projects);
        }

        // If Staff, fetch pending field agents
        if (['staff', 'admin'].includes(userRole)) {
            const { data: agents, error: agentError } = await supabase
                .from('profiles')
                .select('*')
                .eq('role', 'field_agent')
                .order('created_at', { ascending: false });

            if (agentError) console.error("Error fetching agents:", agentError);
            console.log("Fetched Agents:", agents);

            if (agents) setPendingAgents(agents.filter(a => a.status !== 'Verified'));

            // Fetch my past verifications
            const { data: verifications, error: verifyError } = await supabase
                .from('agent_verifications')
                .select('*, agent:agent_id(*)')
                .eq('verifier_id', userId)
                .order('created_at', { ascending: false });

            if (verifyError) console.error("Error fetching verifications:", verifyError);
            console.log("My Past Verifications:", verifications);

            if (verifications) setMyPastVerifications(verifications);
        }
    };

    useEffect(() => {
        const checkUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push("/login");
                return;
            }

            // Fetch profile to get role
            const { data: profile } = await supabase
                .from('profiles')
                .select('role, avatar_url')
                .eq('id', user.id)
                .single();

            if (profile) {
                setRole(profile.role);
                setAvatarUrl(profile.avatar_url);
                setUser(user);
                fetchData(user.id, profile.role);
            }
        };
        checkUser();
    }, [router]);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.refresh();
        router.push("/login");
    };

    const handleSubmitReport = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedProject || !user || !imageFile) return;
        setIsSubmitting(true);

        const formData = new FormData();
        formData.append("projectId", selectedProject.id.toString());
        formData.append("agentId", user.id);
        formData.append("reportText", reportText);
        formData.append("image", imageFile);

        const result = await import("@/app/actions/submit-verification").then(mod => mod.submitVerificationReport(formData));

        if (result.success) {
            alert("Report submitted successfully!");
            setSelectedProject(null);
            setReportText("");
            setImageFile(null);
            // Refresh data not strictly needed for agents view but good practice
        } else {
            alert("Error submitting report: " + result.error);
        }
        setIsSubmitting(false);
    };

    const handleVerifyAgent = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedAgent || !user || !verificationComment) return;
        setIsSubmitting(true);

        const formData = new FormData();
        formData.append("agentId", selectedAgent.id);
        formData.append("verifierId", user.id);
        formData.append("comment", verificationComment);
        if (agentImageFile) formData.append("image", agentImageFile);

        const result = await import("@/app/actions/verify-field-agent").then(mod => mod.verifyFieldAgent(formData));

        if (result.success) {
            alert(`Field Agent ${selectedAgent.full_name} Verified Successfully!`);
            setSelectedAgent(null);
            setVerificationComment("");
            setAgentImageFile(null);
            fetchData(user.id, role!); // Refresh list
        } else {
            alert("Error verifying agent: " + result.error);
        }
        setIsSubmitting(false);
    };

    if (!user || !role) return <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">Loading...</div>;

    return (
        <div className="min-h-screen bg-gray-900 text-white p-8">
            {/* Project Verification Modal */}
            {selectedProject && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 animate-fade-in">
                    <div className="bg-gray-800 p-8 rounded-xl border border-gray-600 max-w-lg w-full relative">
                        <button
                            onClick={() => setSelectedProject(null)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-white"
                        >
                            ✕
                        </button>
                        <h3 className="text-2xl font-bold mb-4">Verify Project: {selectedProject.title}</h3>

                        <form onSubmit={handleSubmitReport} className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold mb-2 text-gray-300">Site Photo Evidence</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                                    className="block w-full text-sm text-gray-400
                                      file:mr-4 file:py-2 file:px-4
                                      file:rounded-full file:border-0
                                      file:text-sm file:font-semibold
                                      file:bg-blue-900 file:text-blue-300
                                      hover:file:bg-blue-800"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold mb-2 text-gray-300">Field Report</label>
                                <textarea
                                    value={reportText}
                                    onChange={(e) => setReportText(e.target.value)}
                                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white h-32 focus:ring-2 focus:ring-blue-500 outline-none"
                                    placeholder="Describe site conditions, progress, and validity..."
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full px-6 py-3 rounded-lg bg-green-600 hover:bg-green-700 text-white font-bold shadow-lg disabled:opacity-50"
                            >
                                {isSubmitting ? "Uploading Report..." : "Submit Verification"}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Agent Verification Modal */}
            {selectedAgent && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 animate-fade-in">
                    <div className="bg-gray-800 p-8 rounded-xl border border-gray-600 max-w-lg w-full relative">
                        <button
                            onClick={() => setSelectedAgent(null)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-white"
                        >
                            ✕
                        </button>
                        <h3 className="text-2xl font-bold mb-4">Verify Field Agent: {selectedAgent.full_name || selectedAgent.email}</h3>

                        <form onSubmit={handleVerifyAgent} className="space-y-4">

                            <div className="p-4 bg-gray-700/50 rounded-lg mb-4">
                                <p className="text-sm text-gray-300"><strong>Email:</strong> {selectedAgent.email}</p>
                                <p className="text-sm text-gray-300"><strong>Current Status:</strong> {selectedAgent.status || 'Pending'}</p>
                            </div>

                            <div>
                                <label className="block text-sm font-bold mb-2 text-gray-300">Verification Comment</label>
                                <textarea
                                    value={verificationComment}
                                    onChange={(e) => setVerificationComment(e.target.value)}
                                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white h-24 focus:ring-2 focus:ring-blue-500 outline-none"
                                    placeholder="Explain who they are and why you are approving them..."
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold mb-2 text-gray-300">ID/Proof Image (Optional)</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => setAgentImageFile(e.target.files?.[0] || null)}
                                    className="block w-full text-sm text-gray-400
                                      file:mr-4 file:py-2 file:px-4
                                      file:rounded-full file:border-0
                                      file:text-sm file:font-semibold
                                      file:bg-blue-900 file:text-blue-300
                                      hover:file:bg-blue-800"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full px-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-lg disabled:opacity-50"
                            >
                                {isSubmitting ? "Verifying..." : "Confirm Verification"}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            <header className="flex justify-between items-center mb-10">
                <div>
                    <h1 className="text-3xl font-bold">Staff Dashboard</h1>
                    <p className="text-gray-400 mt-2">Role: <span className="text-blue-400 font-bold capitalize">{role.replace('_', ' ')}</span></p>
                </div>
                <button onClick={handleLogout} className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg">Logout</button>
            </header>

            <div className="grid grid-cols-1 gap-8">
                {/* Field Agent Specific Views */}
                {role === 'field_agent' && (
                    <>
                        <div className="col-span-full">
                            <h2 className="text-2xl font-bold mb-6">📋 My Assignments</h2>
                            {assignedProjects.length === 0 ? (
                                <div className="p-8 bg-gray-800 rounded-xl border border-gray-700 text-center text-gray-500">
                                    No projects assigned yet. Ask admin to assign you a project.
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {assignedProjects.map(project => (
                                        <div key={project.id} className="bg-gray-800 rounded-xl border border-gray-700 p-6 hover:border-blue-500 transition">
                                            <h3 className="text-xl font-bold text-white mb-2">{project.title}</h3>
                                            <p className="text-gray-400 text-sm mb-4 line-clamp-2">{project.description}</p>
                                            <div className="flex justify-between items-center mt-4">
                                                <span className="text-xs bg-gray-700 px-2 py-1 rounded text-gray-300">📍 {project.location || 'N/A'}</span>
                                                <button
                                                    onClick={() => setSelectedProject(project)}
                                                    className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold px-4 py-2 rounded-lg"
                                                >
                                                    Verify
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </>
                )}

                {/* Common Widget for All Staff (except agents who have the full view above) */}
                {['staff', 'admin'].includes(role) && (
                    <>
                        <div className="col-span-full">
                            <h2 className="text-2xl font-bold mb-6">🕵️ Pending Field Agent Verifications</h2>

                            {pendingAgents.length === 0 ? (
                                <div className="p-8 bg-gray-800 rounded-xl border border-gray-700 text-center text-gray-500">
                                    No new field agents awaiting verification.
                                </div>
                            ) : (
                                <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
                                    <table className="w-full text-left">
                                        <thead className="bg-gray-700 text-gray-300">
                                            <tr>
                                                <th className="p-4">Name</th>
                                                <th className="p-4">Email</th>
                                                <th className="p-4">Status</th>
                                                <th className="p-4">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-700">
                                            {pendingAgents.map(agent => (
                                                <tr key={agent.id} className="hover:bg-gray-700/50">
                                                    <td className="p-4 text-white font-bold">{agent.full_name || 'N/A'}</td>
                                                    <td className="p-4 text-gray-400">{agent.email}</td>
                                                    <td className="p-4">
                                                        <span className="bg-yellow-900/40 text-yellow-400 px-2 py-1 rounded text-xs font-bold uppercase">
                                                            {agent.status || 'Pending'}
                                                        </span>
                                                    </td>
                                                    <td className="p-4">
                                                        <button
                                                            onClick={() => setSelectedAgent(agent)}
                                                            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-sm font-bold shadow-lg"
                                                        >
                                                            Verify Agent
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>

                        <div className="col-span-full">
                            <h2 className="text-2xl font-bold mb-6">📜 My Past Verifications</h2>

                            {myPastVerifications.length === 0 ? (
                                <div className="p-8 bg-gray-800 rounded-xl border border-gray-700 text-center text-gray-500">
                                    You haven't verified any agents yet.
                                </div>
                            ) : (
                                <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
                                    <table className="w-full text-left">
                                        <thead className="bg-gray-700 text-gray-300">
                                            <tr>
                                                <th className="p-4">Date</th>
                                                <th className="p-4">Agent Name</th>
                                                <th className="p-4">Email</th>
                                                <th className="p-4">Comment</th>
                                                <th className="p-4">Current Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-700">
                                            {myPastVerifications.map(log => (
                                                <tr key={log.id} className="hover:bg-gray-700/50">
                                                    <td className="p-4 text-gray-400 text-sm">{new Date(log.created_at).toLocaleDateString()}</td>
                                                    <td className="p-4 text-white font-bold">{log.agent?.full_name || 'N/A'}</td>
                                                    <td className="p-4 text-gray-400">{log.agent?.email}</td>
                                                    <td className="p-4 text-gray-300 max-w-xs truncate">{log.comment}</td>
                                                    <td className="p-4">
                                                        <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${log.agent?.status === 'Verified' ? 'bg-green-900/40 text-green-400' : 'bg-yellow-900/40 text-yellow-400'
                                                            }`}>
                                                            {log.agent?.status || 'Unknown'}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
