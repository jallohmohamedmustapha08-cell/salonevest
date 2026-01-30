"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import AvatarUpload from "@/components/AvatarUpload";

export default function ProfilePage() {
    const [loading, setLoading] = useState(true);
    const [fullname, setFullname] = useState<string | null>(null);
    const [role, setRole] = useState<string | null>(null);
    const [avatar_url, setAvatarUrl] = useState<string | null>(null);
    const [businessName, setBusinessName] = useState<string | null>(null);
    const [bio, setBio] = useState<string | null>(null);
    const [email, setEmail] = useState<string | null>(null);
    const [user, setUser] = useState<any>(null);
    const router = useRouter();

    useEffect(() => {
        const getProfile = async () => {
            const { data: { user } } = await supabase.auth.getUser();

            if (user) {
                setUser(user);
                setEmail(user.email || '');

                const { data, error } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', user.id)
                    .single();

                if (data) {
                    setFullname(data.full_name);
                    setRole(data.role);
                    setAvatarUrl(data.avatar_url);
                    setBusinessName(data.business_name);
                    setBio(data.bio);
                }
            } else {
                router.push("/login");
            }
            setLoading(false);
        };

        getProfile();
    }, [router]);

    const updateProfile = async () => {
        setLoading(true);
        const updates = {
            id: user.id,
            full_name: fullname,
            business_name: businessName,
            bio: bio,
            avatar_url,
            updated_at: new Date(),
        };

        const { error } = await supabase.from('profiles').upsert(updates);

        if (error) {
            alert(error.message);
        } else {
            alert('Profile updated successfully!');
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white font-sans p-4 md:p-8 flex justify-center">
            <div className="max-w-2xl w-full">
                <h1 className="text-3xl font-bold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">Your Profile</h1>

                {loading ? (
                    <div className="animate-pulse flex space-x-4">
                        <div className="rounded-full bg-gray-700 h-24 w-24"></div>
                        <div className="flex-1 space-y-4 py-1">
                            <div className="h-4 bg-gray-700 rounded w-3/4"></div>
                            <div className="space-y-2">
                                <div className="h-4 bg-gray-700 rounded"></div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="glass bg-gray-800/50 p-8 rounded-2xl border border-gray-700 shadow-xl space-y-6">

                        {/* Avatar Section */}
                        <div className="flex justify-center mb-6">
                            <AvatarUpload
                                uid={user.id}
                                url={avatar_url}
                                size={150}
                                onUpload={(url) => {
                                    setAvatarUrl(url);
                                    // Optionally auto-save here too
                                }}
                            />
                        </div>

                        <div className="grid grid-cols-1 gap-6">
                            <div>
                                <label className="block text-gray-400 text-sm font-bold mb-2">Email</label>
                                <input
                                    type="text"
                                    value={email || ''}
                                    disabled
                                    className="w-full bg-gray-900/50 border border-gray-700 text-gray-500 px-4 py-3 rounded-lg cursor-not-allowed"
                                />
                            </div>

                            <div>
                                <label className="block text-gray-400 text-sm font-bold mb-2">Full Name</label>
                                <input
                                    type="text"
                                    value={fullname || ''}
                                    onChange={(e) => setFullname(e.target.value)}
                                    className="w-full bg-gray-900 border border-gray-600 text-white px-4 py-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
                                />
                            </div>

                            {role === 'entrepreneur' && (
                                <div>
                                    <label className="block text-gray-400 text-sm font-bold mb-2">Business / Farm Name</label>
                                    <input
                                        type="text"
                                        value={businessName || ''}
                                        onChange={(e) => setBusinessName(e.target.value)}
                                        className="w-full bg-gray-900 border border-gray-600 text-white px-4 py-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
                                    />
                                </div>
                            )}

                            <div>
                                <label className="block text-gray-400 text-sm font-bold mb-2">Bio</label>
                                <textarea
                                    rows={4}
                                    value={bio || ''}
                                    onChange={(e) => setBio(e.target.value)}
                                    placeholder="Tell us a little about yourself..."
                                    className="w-full bg-gray-900 border border-gray-600 text-white px-4 py-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition resize-none"
                                />
                            </div>

                            <button
                                onClick={updateProfile}
                                disabled={loading}
                                className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-bold py-3 rounded-xl shadow-lg transition transform active:scale-95 disabled:opacity-50"
                            >
                                {loading ? 'Saving...' : 'Update Profile'}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
