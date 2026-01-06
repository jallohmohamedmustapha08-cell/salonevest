"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

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
    const [assignedProjects, setAssignedProjects] = useState<Project[]>([]);
    const router = useRouter();

    // Verification Modal State
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);
    const [reportText, setReportText] = useState("");
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

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
                .select('role')
                .eq('id', user.id)
                .single();

            if (profile) {
                setRole(profile.role);

                // If Field Agent, fetch assigned projects
                if (profile.role === 'field_agent') {
                    const { data: projects } = await supabase
                        .from('projects')
                        .select('*')
                        .eq('assigned_staff_id', user.id);
                    if (projects) setAssignedProjects(projects);
                }
            }
            setUser(user);
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
        } else {
            alert("Error submitting report: " + result.error);
        }
        setIsSubmitting(false);
    };

    if (!user || !role) return <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">Loading...</div>;

    return (
        <div className="min-h-screen bg-gray-900 text-white p-8">
            {/* Verification Modal */}
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

            <header className="flex justify-between items-center mb-10">
                <div>
                    <h1 className="text-3xl font-bold">Staff Dashboard</h1>
                    <p className="text-gray-400 mt-2">Role: <span className="text-blue-400 font-bold capitalize">{role.replace('_', ' ')}</span></p>
                </div>
                <button onClick={handleLogout} className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg">Logout</button>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                {role !== 'field_agent' && (
                    <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
                        <h2 className="text-xl font-bold mb-4">Messages</h2>
                        <p className="text-gray-400">Communication with Admin.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
