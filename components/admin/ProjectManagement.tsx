import { useState } from "react";
interface Project {
    id: number;
    title: string;
    farmer: string;
    score: number;
    status: string;
    funding: number;
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
                                            'bg-blue-900/50 text-blue-400'
                                        }`}>{project.status}</span>
                                </div>
                                <p className="text-gray-400 text-sm">Farmer: <span className="text-white">{project.farmer}</span></p>
                                <div className="mt-2 text-sm text-gray-500">
                                    Raised: <span className="text-white">${project.funding}</span> / ${project.goal}
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
                                    {project.status === 'Pending' && (
                                        <div className="flex gap-2">
                                            <button onClick={() => handleApproveProject(project.id)} className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded text-sm font-bold transition">Approve</button>
                                            <button onClick={() => handleRejectProject(project.id)} className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded text-sm font-bold transition">Reject</button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
