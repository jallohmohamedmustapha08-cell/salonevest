"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';

export default function PublicProjectDetails() {
    const { id } = useParams();
    const router = useRouter();
    const [project, setProject] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProject = async () => {
            if (!id) return;
            const { data } = await supabase
                .from('projects')
                .select('*')
                .eq('id', id)
                .single();
            if (data) setProject(data);
            setLoading(false);
        };
        fetchProject();
    }, [id]);

    if (loading) return <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">Loading...</div>;
    if (!project) return <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">Project not found.</div>;

    return (
        <div className="min-h-screen bg-gray-900 text-white font-sans pt-24 pb-20">
            <div className="max-w-4xl mx-auto px-6">
                <Link href="/explore" className="text-gray-400 hover:text-white mb-6 inline-block">&larr; Back to Explore</Link>

                <div className="bg-gray-800 rounded-2xl overflow-hidden border border-gray-700 shadow-2xl">
                    <div className="relative h-64 md:h-96 w-full">
                        {project.image_url ? (
                            <img src={project.image_url} alt={project.title} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full bg-gray-700 flex items-center justify-center text-gray-500">No Image</div>
                        )}
                        <div className="absolute top-4 right-4 bg-green-600 text-white px-4 py-1 rounded-full font-bold shadow-lg">
                            Active
                        </div>
                    </div>

                    <div className="p-8">
                        <h1 className="text-3xl md:text-5xl font-bold mb-4">{project.title}</h1>
                        <div className="flex items-center gap-4 text-gray-400 mb-8">
                            <span>📍 {project.location || "Sierra Leone"}</span>
                            <span>📅 Launched {new Date(project.created_at).toLocaleDateString()}</span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-10">
                            <div>
                                <h3 className="text-xl font-bold mb-4 text-blue-400">About this Project</h3>
                                <p className="text-gray-300 leading-relaxed text-lg">{project.description}</p>
                            </div>
                            <div className="bg-gray-700/30 p-6 rounded-xl border border-gray-600">
                                <h3 className="text-xl font-bold mb-4">Funding Status</h3>
                                <div className="mb-2 flex justify-between text-sm">
                                    <span className="text-green-400 font-bold text-lg">${(project.funding || 0).toLocaleString()}</span>
                                    <span className="text-gray-400">of ${(project.goal || 0).toLocaleString()} goal</span>
                                </div>
                                <div className="w-full bg-gray-600 rounded-full h-4 mb-6 overflow-hidden">
                                    <div className="bg-green-500 h-full rounded-full" style={{ width: `${Math.min(((project.funding || 0) / (project.goal || 1)) * 100, 100)}%` }}></div>
                                </div>

                                <button
                                    onClick={() => router.push('/dashboard/investor')}
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl transition shadow-lg shadow-blue-900/20"
                                >
                                    Login to Invest
                                </button>
                                <p className="text-xs text-center mt-3 text-gray-500">You must be a registered investor to back this project.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
