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

    return (
        <div className="min-h-screen bg-gray-900 pb-20">
            {/* Hero Section */}
            <section className="relative py-20 px-4 bg-gradient-to-b from-gray-800 to-gray-900 border-b border-gray-800">
                <div className="max-w-6xl mx-auto text-center">
                    <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
                        Explore <span className="text-blue-500">High-Impact</span> Projects
                    </h1>
                    <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10">
                        Discover and fund vetted agricultural and tech initiatives in Sierra Leone.
                        Backed by AI risk assessment and secured by blockchain.
                    </p>

                    {/* Search/Filter Bar */}
                    <div className="max-w-3xl mx-auto bg-gray-800 p-2 rounded-full border border-gray-700 flex flex-col md:flex-row gap-2 shadow-xl">
                        <input
                            type="text"
                            placeholder="Search by location or crop..."
                            className="flex-grow bg-transparent text-white px-6 py-3 focus:outline-none"
                        />
                        <select className="bg-gray-700 text-white px-6 py-3 rounded-full border-none focus:ring-0 cursor-pointer hover:bg-gray-600 transition">
                            <option value="all">All Categories</option>
                            <option value="agriculture">Agriculture</option>
                            <option value="tech">Technology</option>
                            <option value="retail">Retail</option>
                        </select>
                        <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-full font-bold transition">
                            Search
                        </button>
                    </div>
                </div>
            </section>

            {/* Projects Grid */}
            <section className="max-w-7xl mx-auto px-4 py-16">
                <div className="flex justify-between items-end mb-8">
                    <h2 className="text-2xl font-bold text-white">Trending Opportunities</h2>
                </div>

                {loading ? (
                    <div className="text-center text-gray-500">Loading projects...</div>
                ) : projects.length === 0 ? (
                    <div className="text-center text-gray-500 p-10 bg-gray-800 rounded-xl">No active projects found yet.</div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                        {projects.map((project) => {
                            // Simple keyword inference for category
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
