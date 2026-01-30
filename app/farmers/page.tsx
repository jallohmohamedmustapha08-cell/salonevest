"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";
import UserAvatar from "@/components/UserAvatar";

interface EntrepreneurProfile {
    id: string;
    full_name: string;
    business_name: string | null;
    avatar_url: string | null;
    bio?: string;
}

export default function FarmersDirectory() {
    const [farmers, setFarmers] = useState<EntrepreneurProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedFarmer, setSelectedFarmer] = useState<EntrepreneurProfile | null>(null);
    const [farmerProjects, setFarmerProjects] = useState<any[]>([]);
    const [loadingProjects, setLoadingProjects] = useState(false);

    // New States
    const [searchQuery, setSearchQuery] = useState("");
    const [projectCounts, setProjectCounts] = useState<Record<string, number>>({});

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);

            // 1. Fetch profiles with role 'entrepreneur'
            const { data: farmersData } = await supabase
                .from('profiles')
                .select('*')
                .eq('role', 'entrepreneur');

            // 2. Fetch all active projects to count them
            const { data: projectsData } = await supabase
                .from('projects')
                .select('id, entrepreneur_id')
                .eq('status', 'Active');

            if (farmersData) {
                setFarmers(farmersData);
            }

            if (projectsData) {
                const counts: Record<string, number> = {};
                projectsData.forEach((p: any) => {
                    counts[p.entrepreneur_id] = (counts[p.entrepreneur_id] || 0) + 1;
                });
                setProjectCounts(counts);
            }

            setLoading(false);
        };

        fetchData();
    }, []);

    const handleViewProjects = async (farmer: EntrepreneurProfile) => {
        setSelectedFarmer(farmer);
        setLoadingProjects(true);
        setFarmerProjects([]);

        const { data } = await supabase
            .from('projects')
            .select('*')
            .eq('entrepreneur_id', farmer.id)
            .eq('status', 'Active'); // Only show active public projects

        if (data) setFarmerProjects(data);
        setLoadingProjects(false);
    };

    // Filter farmers based on search
    const filteredFarmers = farmers.filter(f =>
        f.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.business_name?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-gray-900 font-sans p-4 md:p-8 pb-24 relative">
            {/* Navbar Placeholder if needed, or rely on Layout */}

            {/* Simple Projects Modal */}
            {selectedFarmer && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
                    <div className="glass bg-gray-900 border border-gray-700 rounded-3xl max-w-2xl w-full max-h-[85vh] overflow-hidden shadow-2xl flex flex-col">
                        <div className="p-6 border-b border-gray-700 flex justify-between items-center bg-gray-800/50">
                            <div>
                                <h2 className="text-xl font-bold text-white">Projects by <span className="text-green-400">{selectedFarmer?.business_name || selectedFarmer?.full_name}</span></h2>
                            </div>
                            <button onClick={() => setSelectedFarmer(null)} className="text-gray-400 hover:text-white p-2 rounded-full hover:bg-gray-700 transition">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>
                        <div className="p-6 space-y-4 overflow-y-auto">
                            {loadingProjects ? (
                                <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500"></div></div>
                            ) : farmerProjects.length === 0 ? (
                                <div className="text-center text-gray-400 py-12 flex flex-col items-center">
                                    <span className="text-4xl mb-4">🌱</span>
                                    <p>No active projects found for this farmer.</p>
                                </div>
                            ) : (
                                farmerProjects.map(project => (
                                    <div key={project.id} className="bg-gray-800/50 rounded-2xl p-4 border border-gray-700/50 hover:border-green-500/30 transition group">
                                        <div className="flex gap-4 items-start">
                                            {project.image_url ? (
                                                <img src={project.image_url} alt={project.title} className="w-24 h-24 object-cover rounded-xl shadow-md group-hover:scale-105 transition duration-500" />
                                            ) : (
                                                <div className="w-24 h-24 bg-gray-700 rounded-xl flex items-center justify-center text-3xl">🌾</div>
                                            )}
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-bold text-white text-lg truncate">{project.title}</h3>
                                                <p className="text-gray-400 text-sm line-clamp-2 mb-3 h-10">{project.description}</p>

                                                <div className="space-y-2">
                                                    <div className="flex justify-between items-end text-xs">
                                                        <span className="text-gray-400">Raised: <span className="text-green-400 font-bold text-sm">${project.funding?.toLocaleString()}</span></span>
                                                        <span className="text-gray-400">Goal: <span className="text-white font-bold text-sm">${project.goal?.toLocaleString()}</span></span>
                                                    </div>
                                                    <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
                                                        <div className="bg-gradient-to-r from-green-500 to-emerald-400 h-2 rounded-full transition-all duration-1000" style={{ width: `${Math.min(((project.funding || 0) / (project.goal || 1)) * 100, 100)}%` }}></div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                        <div className="p-4 border-t border-gray-700 bg-gray-800/50 text-center">
                            <Link href="/login" className="text-sm text-green-400 hover:text-green-300 hover:underline">Log in as Investor to support these farmers →</Link>
                        </div>
                    </div>
                </div>
            )}

            <div className="max-w-7xl mx-auto pt-12 md:pt-20">
                <div className="text-center mb-12 space-y-4">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight">Meet Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-300">Farmers</span></h1>
                    <p className="text-gray-400 max-w-2xl mx-auto text-lg">
                        Discover the hardworking entrepreneurs driving Sierra Leone's agricultural growth. Each verified by our field agents.
                    </p>

                    {/* Search Bar */}
                    <div className="max-w-md mx-auto relative mt-8">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                        </div>
                        <input
                            type="text"
                            placeholder="Search farmers by name..."
                            className="bg-gray-800 border border-gray-700 text-white text-sm rounded-full focus:ring-green-500 focus:border-green-500 block w-full pl-10 p-4 shadow-lg transition placeholder-gray-500"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
                        {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="h-80 bg-gray-800/50 rounded-3xl border border-gray-700"></div>)}
                    </div>
                ) : filteredFarmers.length === 0 ? (
                    <div className="text-center py-20 bg-gray-800/30 rounded-3xl border border-gray-700/50">
                        <span className="text-4xl block mb-4">🔍</span>
                        <h3 className="text-xl font-bold text-white mb-2">No farmers found</h3>
                        <p className="text-gray-400">Try adjusting your search criteria.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredFarmers.map((farmer) => (
                            <div key={farmer.id} className="bg-gray-800 rounded-3xl p-6 hover:-translate-y-2 transition duration-300 group border border-gray-700 hover:border-green-500/50 shadow-xl flex flex-col h-full">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="w-16 h-16 rounded-2xl bg-gray-700 flex items-center justify-center overflow-hidden shadow-inner border border-gray-600">
                                        <UserAvatar url={farmer.avatar_url} size={64} fallbackChar={farmer.full_name.charAt(0)} />
                                    </div>
                                    <div className="bg-green-500/10 text-green-400 text-xs font-bold px-3 py-1 rounded-full border border-green-500/20 flex items-center gap-1">
                                        Verified <svg className="w-3 h-3 fill-current" viewBox="0 0 20 20"><path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" /></svg>
                                    </div>
                                </div>

                                <h3 className="font-bold text-white text-xl mb-1 truncate" title={farmer.business_name || farmer.full_name}>
                                    {farmer.business_name || farmer.full_name}
                                </h3>
                                <p className="text-sm text-gray-400 mb-4 flex items-center gap-1">
                                    <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                    {farmer.full_name}
                                </p>

                                <div className="bg-gray-900/50 rounded-xl p-3 mb-6 flex-1">
                                    <p className="text-gray-300/80 text-sm line-clamp-3 leading-relaxed italic">
                                        "{farmer.bio || "Passionate about implementing modern farming techniques to produce high-quality yields for the community."}"
                                    </p>
                                </div>

                                <div className="pt-4 border-t border-gray-700 flex items-center justify-between">
                                    <div className="text-xs text-gray-400">
                                        <span className="block text-white font-bold text-lg">{projectCounts[farmer.id] || 0}</span>
                                        Active Projects
                                    </div>
                                    <button
                                        onClick={() => handleViewProjects(farmer)}
                                        className="bg-green-600 hover:bg-green-500 text-white font-bold py-2 px-4 rounded-xl transition text-sm shadow-lg shadow-green-900/20"
                                    >
                                        View Projects
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
