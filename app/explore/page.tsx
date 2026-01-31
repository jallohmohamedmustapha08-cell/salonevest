"use client";

import ProjectCard from "@/components/ProjectCard";
import { supabase } from "@/lib/supabaseClient";
import { useEffect, useState } from "react";

interface Project {
    id: any;
    title: string;
    description: string;
    funding: number;
    goal: number;
    image_url: string;
    status: string;
    location: string;
    trust_score: number;
    group?: { name: string; joint_liability_score: number };
}

export default function Explore() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("all");

    useEffect(() => {
        const fetchProjects = async () => {
            const { data } = await supabase
                .from('projects')
                .select('*, group:groups(name, joint_liability_score)')
                .eq('status', 'Active') // STRICTLY show only Active projects. Paused/Pending must be hidden.
                .order('created_at', { ascending: false });

            if (data) setProjects(data);
            setLoading(false);
        };
        fetchProjects();
    }, []);

    const filteredProjects = projects.filter(project => {
        const lowerQuery = searchQuery.toLowerCase();
        const matchesSearch =
            project.title.toLowerCase().includes(lowerQuery) ||
            project.description.toLowerCase().includes(lowerQuery) ||
            (project.location || "").toLowerCase().includes(lowerQuery);

        if (categoryFilter === "all") return matchesSearch;

        // Simple keyword inference for category key matching
        const lowerDesc = (project.description + project.title).toLowerCase();
        let inferredCategory = "general";
        if (lowerDesc.includes('farm') || lowerDesc.includes('rice') || lowerDesc.includes('crop') || lowerDesc.includes('cocoa') || lowerDesc.includes('agriculture')) inferredCategory = "agriculture";
        else if (lowerDesc.includes('tech') || lowerDesc.includes('app') || lowerDesc.includes('digital') || lowerDesc.includes('software')) inferredCategory = "tech";
        else if (lowerDesc.includes('shop') || lowerDesc.includes('market') || lowerDesc.includes('retail') || lowerDesc.includes('store')) inferredCategory = "retail";

        return matchesSearch && inferredCategory === categoryFilter;
    });

    return (
        // Remove bg-gray-900 from root div to let body gradient show
        <div className="min-h-screen pb-20 relative">

            {/* Hero Section */}
            <section className="relative py-24 px-4 overflow-hidden">
                <div className="absolute inset-0 bg-green-900/10 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-green-900/40 via-transparent to-transparent"></div>

                <div className="max-w-6xl mx-auto text-center relative z-10">
                    <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-6 tracking-tight">
                        Explore <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-500">High-Impact</span> Projects
                    </h1>
                    <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-12 leading-relaxed">
                        Discover vetted opportunities. Backed by AI risk assessment and secured by blockchain transparently.
                    </p>

                    {/* Search/Filter Bar */}
                    <div className="max-w-3xl mx-auto glass p-2 rounded-full border border-white/20 flex flex-col md:flex-row gap-2 shadow-2xl">
                        <input
                            type="text"
                            placeholder="Search by location, title or description..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="flex-grow bg-transparent text-white px-6 py-3 focus:outline-none placeholder-gray-400"
                        />
                        <select
                            value={categoryFilter}
                            onChange={(e) => setCategoryFilter(e.target.value)}
                            className="bg-white/5 text-white px-6 py-3 rounded-full border border-white/10 focus:ring-0 cursor-pointer hover:bg-white/10 transition [&>option]:bg-gray-900"
                        >
                            <option value="all">All Categories</option>
                            <option value="agriculture">Agriculture</option>
                            <option value="tech">Technology</option>
                            <option value="retail">Retail</option>
                        </select>
                        <button className="bg-green-600 hover:bg-green-500 text-white px-8 py-3 rounded-full font-bold transition shadow-lg shadow-green-900/20">
                            Search
                        </button>
                    </div>
                </div>
            </section>

            {/* Projects Grid */}
            <section className="max-w-7xl mx-auto px-4 py-8">
                <div className="flex justify-between items-center mb-8 border-b border-white/10 pb-4">
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                        <span className="bg-orange-500 w-2 h-8 rounded-full"></span>
                        Trending Opportunities
                    </h2>
                    <span className="text-sm text-gray-400">Showing {filteredProjects.length} projects</span>
                </div>

                {loading ? (
                    <div className="text-center text-gray-400 py-12 animate-pulse">Loading amazing projects...</div>
                ) : filteredProjects.length === 0 ? (
                    <div className="text-center text-gray-400 py-20 bg-white/5 rounded-3xl border border-white/5">
                        <p className="text-xl mb-2">No projects found matching your criteria.</p>
                        <p className="text-sm">Try using simpler keywords or clearing filters.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                        {filteredProjects.map((project) => {
                            // Simple keyword inference for category for display
                            const lowerDesc = (project.description + project.title).toLowerCase();
                            let inferredCategory = "General";
                            if (lowerDesc.includes('farm') || lowerDesc.includes('rice') || lowerDesc.includes('crop') || lowerDesc.includes('cocoa')) inferredCategory = "Agriculture";
                            else if (lowerDesc.includes('tech') || lowerDesc.includes('app') || lowerDesc.includes('digital')) inferredCategory = "Technology";
                            else if (lowerDesc.includes('shop') || lowerDesc.includes('market') || lowerDesc.includes('retail')) inferredCategory = "Retail";

                            return (
                                <ProjectCard
                                    key={project.id}
                                    id={String(project.id)}
                                    title={project.title}
                                    category={inferredCategory}
                                    location={project.location || "Sierra Leone"}
                                    imageUrl={project.image_url || "https://images.unsplash.com/photo-1592982537447-6f2a6a0c7c18?q=80&w=2070&auto=format&fit=crop"}
                                    fundingGoal={project.goal}
                                    currentFunding={project.funding || 0}
                                    trustScore={project.trust_score || 0}
                                    minInvestment={50} // Default
                                    groupName={project.group?.name}
                                    groupScore={project.group?.joint_liability_score}
                                />
                            );
                        })}
                    </div>
                )}
            </section>
        </div>
    );
}
