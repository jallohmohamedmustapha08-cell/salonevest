"use client";

import { useState } from "react";
import Link from "next/link";

export default function UploadProject() {
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        location: "",
        fundingGoal: "",
        duration: "",
        cropType: "",
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log("Upload Project:", formData);
    };

    return (
        <div className="min-h-screen bg-gray-900 p-4 md:p-8 pb-20">
            <div className="max-w-3xl mx-auto">
                <div className="mb-8">
                    <Link href="/farmers" className="text-gray-400 hover:text-white flex items-center gap-2 mb-4">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                        </svg>
                        Back to Dashboard
                    </Link>
                    <h1 className="text-3xl font-bold text-white">Upload New Project</h1>
                    <p className="text-gray-400">Share your project details to attract investors.</p>
                </div>

                <form onSubmit={handleSubmit} className="bg-gray-800 rounded-2xl border border-gray-700 p-6 md:p-8 space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-300 mb-2">Project Title</label>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                className="w-full bg-gray-700/50 border border-gray-600 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500"
                                placeholder="e.g., Kambia Cassava Expansion"
                                required
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                rows={4}
                                className="w-full bg-gray-700/50 border border-gray-600 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500"
                                placeholder="Describe your farm, what you need funding for, and the expected impact..."
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Location</label>
                            <input
                                type="text"
                                name="location"
                                value={formData.location}
                                onChange={handleChange}
                                className="w-full bg-gray-700/50 border border-gray-600 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500"
                                placeholder="e.g., Kambia District"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Crop Type</label>
                            <select
                                name="cropType"
                                value={formData.cropType}
                                onChange={handleChange}
                                className="w-full bg-gray-700/50 border border-gray-600 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500"
                                required
                            >
                                <option value="">Select Crop</option>
                                <option value="Rice">Rice</option>
                                <option value="Cassava">Cassava</option>
                                <option value="Cocoa">Cocoa</option>
                                <option value="Coffee">Coffee</option>
                                <option value="Vegetables">Vegetables</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Funding Goal ($)</label>
                            <input
                                type="number"
                                name="fundingGoal"
                                value={formData.fundingGoal}
                                onChange={handleChange}
                                className="w-full bg-gray-700/50 border border-gray-600 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500"
                                placeholder="5000"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Duration (Months)</label>
                            <input
                                type="number"
                                name="duration"
                                value={formData.duration}
                                onChange={handleChange}
                                className="w-full bg-gray-700/50 border border-gray-600 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500"
                                placeholder="12"
                                required
                            />
                        </div>
                    </div>

                    <div className="pt-4">
                        <button
                            type="submit"
                            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-xl transition duration-300 shadow-lg"
                        >
                            Submit Project for Review
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
