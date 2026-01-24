"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";

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

    useEffect(() => {
        const fetchFarmers = async () => {
            // Fetch profiles with role 'entrepreneur'
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('role', 'entrepreneur');

            if (data) {
                setFarmers(data);
            }
            setLoading(false);
        };

        fetchFarmers();
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

    return (
        <div className="min-h-screen bg-gray-900 p-4 md:p-8 pb-24 relative">
            {/* Simple Projects Modal */}
            {selectedFarmer && (
                <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 animate-fade-in">
                    <div className="bg-gray-800 rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto border border-gray-700">
                        <div className="p-6 border-b border-gray-700 flex justify-between items-center sticky top-0 bg-gray-800 z-10">
                            <div>
                                <h2 className="text-xl font-bold text-white">Projects by {selectedFarmer.business_name || selectedFarmer.full_name}</h2>
                            </div>
                            <button onClick={() => setSelectedFarmer(null)} className="text-gray-400 hover:text-white p-2">✕</button>
                        </div>
                        <div className="p-6 space-y-4">
                            {loadingProjects ? (
                                <div className="text-center text-gray-500 py-8">Loading projects...</div>
                            ) : farmerProjects.length === 0 ? (
                                <div className="text-center text-gray-500 py-8">No active projects found for this farmer.</div>
                            ) : (
                                farmerProjects.map(project => (
                                    <div key={project.id} className="bg-gray-700/50 rounded-xl p-4 border border-gray-600">
                                        <div className="flex gap-4">
                                            {project.image_url && (
                                                <img src={project.image_url} alt={project.title} className="w-20 h-20 object-cover rounded-lg" />
                                            )}
                                            <div className="flex-1">
                                                <h3 className="font-bold text-white text-lg">{project.title}</h3>
                                                <p className="text-gray-400 text-sm line-clamp-2 mb-2">{project.description}</p>
                                                <div className="flex justify-between items-center text-xs">
                                                    <span className="text-green-400 font-bold">${project.funding?.toLocaleString()} / ${project.goal?.toLocaleString()}</span>
                                                    {/* In future, link to full project details or handle investment via investor dashboard */}
                                                </div>
                                                <div className="w-full bg-gray-600 rounded-full h-1.5 mt-2">
                                                    <div className="bg-green-500 h-1.5 rounded-full" style={{ width: `${Math.min(((project.funding || 0) / (project.goal || 1)) * 100, 100)}%` }}></div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                        <div className="p-4 border-t border-gray-700 bg-gray-800 sticky bottom-0 text-center">
                            <p className="text-xs text-gray-500">To invest in these projects, please log in to your Investor Dashboard.</p>
                        </div>
                    </div>
                </div>
            )}

            <div className="max-w-6xl mx-auto">
                <div className="text-center mb-12 pt-8">
                    <h1 className="text-4xl font-bold text-white mb-4">Meet Our Farmers</h1>
                    <p className="text-gray-400 max-w-2xl mx-auto">
                        Discover the hardworking entrepreneurs driving Sierra Leone's agricultural growth.
                    </p>
                </div>

                {loading ? (
                    <div className="text-center text-white">Loading farmers...</div>
                ) : farmers.length === 0 ? (
                    <div className="text-center text-gray-500">No farmers found yet.</div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {farmers.map((farmer) => (
                            <div key={farmer.id} className="bg-gray-800 rounded-2xl p-6 border border-gray-700 shadow-md hover:border-green-500 transition group">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="w-16 h-16 rounded-full bg-green-900/50 flex items-center justify-center text-2xl font-bold text-green-400 group-hover:scale-110 transition">
                                        {farmer.avatar_url ? (
                                            <img src={farmer.avatar_url} alt={farmer.full_name} className="w-full h-full object-cover rounded-full" />
                                        ) : (
                                            farmer.full_name.charAt(0)
                                        )}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-white text-lg">{farmer.business_name || farmer.full_name}</h3>
                                        {farmer.business_name && <p className="text-sm text-gray-400">{farmer.full_name}</p>}
                                    </div>
                                </div>

                                <p className="text-gray-400 text-sm mb-6 line-clamp-3">
                                    {farmer.bio || "Dedicated to sustainable agriculture and community growth in Sierra Leone."}
                                </p>

                                <div className="border-t border-gray-700 pt-4">
                                    {/* Future: Link to their public profile or projects */}
                                    <button
                                        onClick={() => handleViewProjects(farmer)}
                                        className="w-full bg-gray-700 hover:bg-gray-600 text-green-400 font-bold py-2 rounded-xl transition text-sm"
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
