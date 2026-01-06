"use client";

import { useState } from "react";
import Link from "next/link";

export default function FarmersDashboard() {
    const [projects, setProjects] = useState([
        {
            id: "1",
            title: "Kambia Cassava Farm",
            status: "Active",
            funding: 3200,
            goal: 5000,
            trustScore: 92,
        },
        {
            id: "5",
            title: "New Rice Field Expansion",
            status: "Pending",
            funding: 0,
            goal: 2000,
            trustScore: 0,
        },
    ]);

    return (
        <div className="min-h-screen bg-gray-900 p-4 pb-24">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-8 pt-4">
                    <h1 className="text-3xl font-bold text-white mb-2">My Farm / Mi Fam</h1>
                    <p className="text-gray-400">Welcome back. Here is your progress.</p>
                </div>

                {/* Action Buttons - Large Touch Targets */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                    <Link href="/farmers/upload" className="bg-green-600 hover:bg-green-700 text-white p-6 rounded-2xl shadow-lg transition flex items-center gap-4 group">
                        <div className="bg-white/20 p-3 rounded-full group-hover:scale-110 transition">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                            </svg>
                        </div>
                        <div className="text-left">
                            <span className="block font-bold text-lg">Add New Project</span>
                            <span className="text-green-200 text-sm">Upload farm details</span>
                        </div>
                    </Link>

                    <Link href="/investors" className="bg-blue-600 hover:bg-blue-700 text-white p-6 rounded-2xl shadow-lg transition flex items-center gap-4 group">
                        <div className="bg-white/20 p-3 rounded-full group-hover:scale-110 transition">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                        <div className="text-left">
                            <span className="block font-bold text-lg">Find Investors</span>
                            <span className="text-blue-200 text-sm">Connect with funding</span>
                        </div>
                    </Link>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 gap-4 mb-8">
                    <div className="bg-gray-800 p-5 rounded-2xl border border-gray-700">
                        <div className="text-gray-400 text-sm font-medium mb-1">Money Raised</div>
                        <div className="text-2xl font-bold text-white">$3,200</div>
                    </div>
                    <div className="bg-gray-800 p-5 rounded-2xl border border-gray-700">
                        <div className="text-gray-400 text-sm font-medium mb-1">Trust Score</div>
                        <div className="text-2xl font-bold text-blue-400">92<span className="text-sm text-gray-500">/100</span></div>
                    </div>
                </div>

                {/* Projects List - Card Style for Mobile */}
                <h2 className="text-xl font-bold text-white mb-4">Your Projects</h2>
                <div className="space-y-4">
                    {projects.map((project) => (
                        <div key={project.id} className="bg-gray-800 rounded-2xl p-5 border border-gray-700 shadow-md">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="font-bold text-white text-lg">{project.title}</h3>
                                    <span
                                        className={`inline-block mt-1 px-3 py-1 rounded-full text-xs font-bold ${project.status === "Active"
                                                ? "bg-green-900/50 text-green-400 border border-green-700"
                                                : "bg-yellow-900/50 text-yellow-400 border border-yellow-700"
                                            }`}
                                    >
                                        {project.status}
                                    </span>
                                </div>
                                <button className="text-gray-400 hover:text-white p-2">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                                    </svg>
                                </button>
                            </div>

                            <div className="mb-4">
                                <div className="flex justify-between text-sm mb-2">
                                    <span className="text-gray-400">Funding Progress</span>
                                    <span className="text-white font-bold">
                                        ${project.funding.toLocaleString()} <span className="text-gray-500 font-normal">/ ${project.goal.toLocaleString()}</span>
                                    </span>
                                </div>
                                <div className="w-full bg-gray-700 rounded-full h-3">
                                    <div
                                        className="bg-green-500 h-3 rounded-full transition-all duration-500"
                                        style={{ width: `${Math.min((project.funding / project.goal) * 100, 100)}%` }}
                                    ></div>
                                </div>
                            </div>

                            <button className="w-full bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 rounded-xl transition">
                                View Details
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
