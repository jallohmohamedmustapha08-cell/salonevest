"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createGroup } from "@/app/actions/groups";
import { searchProfiles } from "@/app/actions/profile-search";
import { supabase } from "@/lib/supabaseClient";

export default function CreateGroupPage() {
    const [name, setName] = useState("");
    const [location, setLocation] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [selectedMembers, setSelectedMembers] = useState<any[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const router = useRouter();

    const handleSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const query = e.target.value;
        setSearchQuery(query);
        if (query.length > 2) {
            const results = await searchProfiles(query);
            setSearchResults(results);
        } else {
            setSearchResults([]);
        }
    };

    const addMember = (user: any) => {
        if (selectedMembers.find(m => m.id === user.id)) return;
        setSelectedMembers([...selectedMembers, user]);
        setSearchQuery("");
        setSearchResults([]);
    };

    const removeMember = (userId: string) => {
        setSelectedMembers(selectedMembers.filter(m => m.id !== userId));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            alert("Please log in.");
            router.push("/login");
            return;
        }

        if (selectedMembers.length < 2) {
            alert("A group must have at least 2 other members (plus yourself).");
            setIsSubmitting(false);
            return;
        }

        const memberIds = selectedMembers.map(m => m.id);
        const result = await createGroup(name, user.id, memberIds, location);

        if (result.success) {
            alert(`Group '${name}' created successfully!`);
            router.push("/dashboard/entrepreneur");
        } else {
            alert("Error creating group: " + result.error);
        }
        setIsSubmitting(false);
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white font-sans p-8">
            <div className="max-w-2xl mx-auto">
                <button
                    onClick={() => router.back()}
                    className="text-gray-400 hover:text-white mb-6 flex items-center gap-2"
                >
                    &larr; Back to Dashboard
                </button>

                <h1 className="text-3xl font-bold mb-2">Create a Lending Group</h1>
                <p className="text-gray-400 mb-8">Form a group with trusted peers to access larger loans and share liability.</p>

                <form onSubmit={handleSubmit} className="space-y-6 bg-gray-800 p-8 rounded-xl border border-gray-700 shadow-xl">

                    {/* Group Details */}
                    <div>
                        <label className="block text-sm font-bold mb-2 text-gray-300">Group Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full bg-gray-700 border border-gray-600 rounded px-4 py-3 text-white focus:outline-none focus:border-green-500"
                            placeholder="e.g. Kabala Rice Growers"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold mb-2 text-gray-300">Location</label>
                        <input
                            type="text"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            className="w-full bg-gray-700 border border-gray-600 rounded px-4 py-3 text-white focus:outline-none focus:border-green-500"
                            placeholder="e.g. Koinadugu District"
                            required
                        />
                    </div>

                    {/* Member Search */}
                    <div>
                        <label className="block text-sm font-bold mb-2 text-gray-300">Add Members (Min 2)</label>
                        <div className="relative">
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={handleSearch}
                                className="w-full bg-gray-700 border border-gray-600 rounded px-4 py-3 text-white focus:outline-none focus:border-blue-500"
                                placeholder="Search by name or email..."
                            />
                            {searchResults.length > 0 && (
                                <ul className="absolute z-10 w-full bg-gray-700 border border-gray-600 rounded-b mt-1 shadow-lg max-h-48 overflow-y-auto">
                                    {searchResults.map(result => (
                                        <li
                                            key={result.id}
                                            onClick={() => addMember(result)}
                                            className="px-4 py-3 hover:bg-gray-600 cursor-pointer flex justify-between items-center bg-gray-700"
                                        >
                                            <span className="font-bold">{result.full_name || "Unnamed"}</span>
                                            <span className="text-xs text-gray-400">{result.email}</span>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>

                    {/* Selected Members List */}
                    {selectedMembers.length > 0 && (
                        <div className="bg-gray-700/50 p-4 rounded-lg">
                            <h4 className="text-xs font-bold text-gray-400 uppercase mb-3">Selected Members ({selectedMembers.length})</h4>
                            <ul className="space-y-2">
                                {selectedMembers.map(member => (
                                    <li key={member.id} className="flex justify-between items-center bg-gray-600/50 px-3 py-2 rounded">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-xs font-bold">
                                                {(member.full_name?.[0] || 'U').toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold">{member.full_name}</p>
                                                <p className="text-xs text-gray-400">{member.email}</p>
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => removeMember(member.id)}
                                            className="text-red-400 hover:text-red-300 text-xs font-bold px-2 py-1"
                                        >
                                            Remove
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white font-bold py-4 rounded-xl shadow-lg transform transition active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? "Creating Group..." : "Create Group"}
                    </button>
                </form>
            </div>
        </div>
    );
}
