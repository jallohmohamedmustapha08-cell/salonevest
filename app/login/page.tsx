"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { getUserRole } from "@/lib/auth-helpers";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const { data: { user }, error: signInError } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (signInError) throw signInError;
            if (!user) throw new Error("No user found");

            const role = await getUserRole(user.id);

            if (!role) {
                router.refresh();
                router.push("/dashboard"); // Fallback for no role
            }
            else if (role === 'admin') { router.refresh(); router.push("/admin"); }
            else if (role === 'entrepreneur') { router.refresh(); router.push("/dashboard/entrepreneur"); }
            else if (role === 'investor') { router.refresh(); router.push("/dashboard/investor"); }
            else if (['staff', 'field_agent', 'verifier', 'moderator'].includes(role)) { router.refresh(); router.push("/dashboard/staff"); }
            else { router.refresh(); router.push("/admin"); } // Default fallback

        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4 py-12 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-green-600 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-600 rounded-full blur-[120px]"></div>
            </div>

            <div className="max-w-md w-full bg-gray-800/80 backdrop-blur-xl rounded-3xl border border-gray-700 shadow-2xl p-8 relative z-10">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2">Welcome Back</h1>
                    <p className="text-gray-300">Sign in to access your dashboard.</p>
                </div>

                {error && (
                    <div className="mb-4 bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded-lg text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Email Address</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-gray-700/50 border border-gray-600 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500"
                            placeholder="you@example.com"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-gray-700/50 border border-gray-600 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500"
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 text-white font-bold py-4 px-4 rounded-xl transition duration-300 shadow-lg flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? "Signing In..." : "Sign In"}
                    </button>
                </form>

                <div className="mt-8 text-center text-sm text-gray-400">
                    <p className="mb-4">
                        Don't have an account?
                    </p>
                    <div className="flex justify-center gap-4">
                        <Link href="/register/entrepreneur" className="text-green-400 hover:text-green-300 font-bold">
                            Join as Entrepreneur
                        </Link>
                        <span className="text-gray-600">|</span>
                        <Link href="/register/investor" className="text-blue-400 hover:text-blue-300 font-bold">
                            Join as Investor
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
