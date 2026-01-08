import { useState } from "react";

interface Project {
    id: number;
    title: string;
    farmer: string;
    score: number;
    status: string;
    funding: number;
    released: number; // New field
    goal: number;
    assigned_staff_id?: string;
}

interface ProjectManagementProps {
    projects: Project[];
    staff: any[]; // List of staff for assignment dropdown
    handleApproveProject: (id: number) => void;
    handleRejectProject: (id: number) => void;
    onActionComplete?: () => void;
}

export default function ProjectManagement({ projects, staff, handleApproveProject, handleRejectProject, onActionComplete }: ProjectManagementProps) {
    const [releasingProject, setReleasingProject] = useState<Project | null>(null);
    const [releaseAmount, setReleaseAmount] = useState("");
    const [isReleasing, setIsReleasing] = useState(false);

    const handleAssignStaff = async (projectId: number, staffId: string) => {
        if (!staffId || staffId === "Assign Staff...") return;

        const result = await import("@/app/actions/assign-project").then(mod => mod.assignProject(projectId, staffId));
        if (result.success) {
            alert("Project assigned successfully!");
            if (onActionComplete) onActionComplete();
        } else {
            alert("Error assigning project: " + result.error);
        }
    };

    const handleReleaseFunds = async () => {
        if (!releasingProject || !releaseAmount) return;
        const amount = parseFloat(releaseAmount);

        if (isNaN(amount) || amount <= 0) {
            alert("Please enter a valid amount.");
            return;
        }

        if (amount > (releasingProject.funding - releasingProject.released)) {
            alert("Cannot release more than available funds.");
            return;
        }

        setIsReleasing(true);
        const result = await import("@/app/actions/release-funds").then(mod => mod.releaseFunds(releasingProject.id, amount));

        if (result.success) {
            alert(`Successfully released $${amount} to the entrepreneur!`);
            setReleasingProject(null);
            setReleaseAmount("");
            if (onActionComplete) onActionComplete();
        } else {
            alert("Error releasing funds: " + result.error);
        }
        setIsReleasing(false);
    };

    const [filter, setFilter] = useState('All');

    const filteredProjects = projects.filter(project => {
        if (filter === 'All') return true;
        if (filter === 'Pending Approval') return project.status === 'Pending';
        if (filter === 'Active') return project.status === 'Active';
        return true;
    });

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold text-white">Project Management</h2>

            {/* Release Funds Modal */}
            {releasingProject && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
                    <div className="bg-gray-800 p-8 rounded-xl border border-gray-600 max-w-sm w-full relative">
                        <button
                            onClick={() => setReleasingProject(null)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-white"
                        >
                            ✕
                        </button>
                        <h3 className="text-xl font-bold mb-4 text-white">Release Funds</h3>
                        <p className="text-gray-400 text-sm mb-4">Project: <span className="text-white font-bold">{releasingProject.title}</span></p>

                        <div className="space-y-4">
                            <div className="bg-gray-700/50 p-3 rounded-lg">
                                <div className="flex justify-between text-sm text-gray-400 mb-1">
                                    <span>Total Raised:</span>
                                    <span className="text-white">${releasingProject.funding}</span>
                                </div>
                                <div className="flex justify-between text-sm text-gray-400 mb-1">
                                    <span>Already Released:</span>
                                    <span className="text-white">${releasingProject.released}</span>
                                </div>
                                <div className="flex justify-between text-sm font-bold text-blue-400 pt-2 border-t border-gray-600">
                                    <span>Available:</span>
                                    <span>${releasingProject.funding - releasingProject.released}</span>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold mb-1 text-gray-300">Amount to Release ($)</label>
                                <input
                                    type="number"
                                    value={releaseAmount}
                                    onChange={(e) => setReleaseAmount(e.target.value)}
                                    className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                                    max={releasingProject.funding - releasingProject.released}
                                    placeholder="0.00"
                                />
                            </div>

                            <button
                                onClick={handleReleaseFunds}
                                disabled={isReleasing}
                                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 rounded transition disabled:opacity-50"
                            >
                                {isReleasing ? "Processing..." : "Confirm Release"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="flex gap-4 mb-6">
                <button
                    onClick={() => setFilter('All')}
                    className={`px-4 py-2 rounded-lg font-bold transition ${filter === 'All' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'}`}
                >
                    All Projects
                </button>
                <button
                    onClick={() => setFilter('Pending Approval')}
                    className={`px-4 py-2 rounded-lg font-bold transition ${filter === 'Pending Approval' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'}`}
                >
                    Pending Approval
                </button>
                <button
                    onClick={() => setFilter('Active')}
                    className={`px-4 py-2 rounded-lg font-bold transition ${filter === 'Active' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'}`}
                >
                    Active
                </button>
            </div>

            <div className="space-y-4">
                {filteredProjects.length === 0 ? (
                    <div className="text-gray-400 text-center py-10 bg-gray-800 rounded-xl border border-gray-700">
                        No projects found with this status.
                    </div>
                ) : (
                    filteredProjects.map((project) => (
                        <div key={project.id} className="bg-gray-800 p-6 rounded-xl border border-gray-700 flex flex-col md:flex-row justify-between items-center gap-4 shadow-md hover:border-gray-600 transition">
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-1">
                                    <h3 className="text-xl font-bold text-white">{project.title}</h3>
                                    <span className={`px-2 py-0.5 text-xs rounded font-bold ${project.status === 'Pending' ? 'bg-yellow-900/50 text-yellow-400' :
                                        project.status === 'Active' ? 'bg-green-900/50 text-green-400' :
                                            project.status === 'Paused' ? 'bg-orange-900/50 text-orange-400' :
                                                'bg-blue-900/50 text-blue-400'
                                        }`}>{project.status}</span>
                                </div>
                                <p className="text-gray-400 text-sm">Farmer: <span className="text-white">{project.farmer}</span></p>
                                <div className="mt-2 text-sm text-gray-500">
                                    Raised: <span className="text-white font-bold">${project.funding}</span>
                                    <span className="mx-2">|</span>
                                    Released: <span className="text-green-400 font-bold">${project.released || 0}</span>
                                    <span className="mx-2">/</span>
                                    Goal: ${project.goal}
                                </div>
                            </div>

                            <div className="flex items-center gap-6">
                                <div className="text-center">
                                    <span className="block text-xs text-gray-500 uppercase">Trust Score</span>
                                    <span className="text-xl font-bold text-blue-400">{project.score}/100</span>
                                </div>

                                <div className="flex flex-col gap-2 min-w-[140px]">
                                    <select
                                        className="bg-gray-700 border border-gray-600 text-white text-sm px-3 py-2 rounded focus:outline-none"
                                        onChange={(e) => handleAssignStaff(project.id, e.target.value)}
                                        defaultValue={project.assigned_staff_id || ""}
                                    >
                                        <option value="">Assign Staff...</option>
                                        {staff.map(s => (
                                            <option key={s.id} value={s.id}>{s.full_name || s.name}</option>
                                        ))}
                                    </select>

                                    {/* Action Buttons based on Status */}
                                    <div className="grid grid-cols-2 gap-2">
                                        {project.status === 'Pending' && (
                                            <>
                                                <button onClick={() => handleApproveProject(project.id)} className="bg-green-600 hover:bg-green-700 text-white py-1.5 rounded text-xs font-bold transition">Approve</button>
                                                <button onClick={() => handleRejectProject(project.id)} className="bg-red-600 hover:bg-red-700 text-white py-1.5 rounded text-xs font-bold transition">Reject</button>
                                            </>
                                        )}

                                        {project.status === 'Active' && (
                                            <>
                                                <button
                                                    onClick={() => setReleasingProject(project)}
                                                    className="col-span-2 bg-blue-600 hover:bg-blue-700 text-white py-1.5 rounded text-xs font-bold transition"
                                                >
                                                    Release $$$
                                                </button>
                                                <button
                                                    onClick={async () => {
                                                        const mod = await import("@/app/actions/update-project-status");
                                                        if (confirm("Unverify? This will reset status to Pending.")) {
                                                            await mod.updateProjectStatus(project.id, 'Pending');
                                                            onActionComplete?.();
                                                        }
                                                    }}
                                                    className="col-span-2 bg-gray-600 hover:bg-gray-700 text-white py-1.5 rounded text-xs font-bold transition"
                                                >
                                                    Unverify
                                                </button>
                                            </>
                                        )}

                                        {project.status === 'Paused' && (
                                            // No buttons for Paused status after removing Resume
                                            <></>
                                        )}

                                        <button
                                            onClick={async () => {
                                                if (confirm("PERMANENTLY DELETE project? This cannot be undone.")) {
                                                    const mod = await import("@/app/actions/delete-project");
                                                    await mod.deleteProject(project.id);
                                                    onActionComplete?.();
                                                }
                                            }}
                                            className="col-span-2 bg-red-900/80 hover:bg-red-900 text-white py-1.5 rounded text-xs font-bold transition border border-red-800"
                                        >
                                            Delete Project
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
