"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createProject } from "@/app/actions/create-project";

interface ProjectUploadFormProps {
    userId: string;
    userGroups: any[]; // Or define strict type
}

export default function ProjectUploadForm({ userId, userGroups }: ProjectUploadFormProps) {
    const [loading, setLoading] = useState(false);
    const [preview, setPreview] = useState<string | null>(null);
    const [selectedGroupId, setSelectedGroupId] = useState<string>("");
    const router = useRouter();

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const objectUrl = URL.createObjectURL(file);
            setPreview(objectUrl);
        }
    };

    const handleSubmit = async (formData: FormData) => {
        try {
            setLoading(true);
            console.log("Submitting form...");

            // Append userId to formData
            formData.set("userId", userId);
            if (selectedGroupId) {
                formData.set("groupId", selectedGroupId);
            }

            const result = await createProject(formData);
            console.log("Server action result:", result);

            if (result.error) {
                alert("Error: " + result.error);
            } else {
                alert("Project submitted successfully for review!");
                router.push("/dashboard/entrepreneur");
            }
        } catch (error: any) {
            console.error("Submission error:", error);
            alert("Unexpected error: " + (error.message || error));
        } finally {
            setLoading(false);
        }
    };

    return (
        <form action={handleSubmit} className="space-y-6 bg-gray-800 p-8 rounded-xl border border-gray-700 max-w-2xl mx-auto shadow-2xl">
            {/* Group Selection */}
            {userGroups && userGroups.length > 0 && (
                <div className="bg-blue-900/20 p-4 rounded-lg border border-blue-500/30">
                    <label className="block text-blue-200 mb-2 font-bold text-sm">Campaign Owner</label>
                    <select
                        value={selectedGroupId}
                        onChange={(e) => setSelectedGroupId(e.target.value)}
                        className="w-full bg-gray-700 border border-gray-600 text-white px-4 py-3 rounded-lg focus:ring-2 focus:ring-blue-500 transition"
                    >
                        <option value="">Myself (Individual)</option>
                        {userGroups.map(g => (
                            <option key={g.id} value={g.id}>Group: {g.name}</option>
                        ))}
                    </select>
                    <p className="text-xs text-blue-400 mt-2">
                        {selectedGroupId ? "Funds will be managed by the Group Leader and require member approval." : "Funds will be sent directly to your wallet."}
                    </p>
                </div>
            )}

            {/* Title */}
            <div>
                <label className="block text-gray-400 mb-2 font-bold">Project Title</label>
                <input name="title" type="text" placeholder="e.g. Sustainable Cassava Farm" required className="w-full bg-gray-700 border border-gray-600 text-white px-4 py-3 rounded-lg focus:ring-2 focus:ring-green-500 transition" />
            </div>

            {/* Category & Location */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-gray-400 mb-2 font-bold">Category</label>
                    <select name="category" className="w-full bg-gray-700 border border-gray-600 text-white px-4 py-3 rounded-lg focus:ring-2 focus:ring-green-500 transition">
                        <option value="Agriculture">Agriculture</option>
                        <option value="Technology">Technology</option>
                        <option value="Retail">Retail</option>
                        <option value="Manufacturing">Manufacturing</option>
                        <option value="Services">Services</option>
                    </select>
                </div>
                <div>
                    <label className="block text-gray-400 mb-2 font-bold">Location</label>
                    <input name="location" type="text" placeholder="e.g. Bo District" required className="w-full bg-gray-700 border border-gray-600 text-white px-4 py-3 rounded-lg focus:ring-2 focus:ring-green-500 transition" />
                </div>
            </div>

            {/* Goal */}
            <div>
                <label className="block text-gray-400 mb-2 font-bold">Funding Goal ($)</label>
                <input name="goal" type="number" placeholder="5000" min="100" required className="w-full bg-gray-700 border border-gray-600 text-white px-4 py-3 rounded-lg focus:ring-2 focus:ring-green-500 transition" />
            </div>

            {/* Description */}
            <div>
                <label className="block text-gray-400 mb-2 font-bold">Description</label>
                <textarea name="description" rows={5} placeholder="Describe your project, what the funds are for, and the expected impact..." required className="w-full bg-gray-700 border border-gray-600 text-white px-4 py-3 rounded-lg focus:ring-2 focus:ring-green-500 transition"></textarea>
            </div>

            {/* Image Upload */}
            <div>
                <label className="block text-gray-400 mb-2 font-bold">Cover Image</label>
                <div className="relative border-2 border-dashed border-gray-600 rounded-lg p-6 flex flex-col items-center justify-center hover:border-green-500 transition cursor-pointer bg-gray-700/30">
                    <input
                        type="file"
                        name="image"
                        accept="image/*"
                        required
                        onChange={handleImageChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    {preview ? (
                        <img src={preview} alt="Preview" className="h-48 object-cover rounded-lg shadow-md" />
                    ) : (
                        <div className="text-center text-gray-500">
                            <svg className="w-12 h-12 mx-auto mb-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                            <span className="font-medium text-white">Click to upload image</span>
                            <p className="text-xs text-gray-400 mt-1">PNG, JPG up to 5MB</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Submit Button */}
            <button
                type="submit"
                disabled={loading}
                className={`w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-lg shadow-lg transform hover:scale-[1.02] transition-all duration-200 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
                {loading ? "Submitting..." : "Submit Application"}
            </button>
        </form>
    );
}
