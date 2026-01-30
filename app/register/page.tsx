import Link from "next/link";

export default function Register() {
    return (
        <div className="min-h-screen relative flex items-center justify-center px-4 py-20 overflow-hidden">
            {/* Dynamic Background */}
            <div className="absolute inset-0 bg-gray-900 -z-20"></div>
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-gray-800 via-gray-900 to-black -z-10"></div>

            <div className="max-w-5xl w-full text-center relative z-10">
                <Link href="/" className="inline-block mb-4">
                    <span className="text-2xl font-bold text-white/50 hover:text-white transition">← Back to Home</span>
                </Link>
                <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-6 tracking-tight">
                    Join <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-300">SaloneVest</span>
                </h1>
                <p className="text-xl text-gray-300 mb-16 max-w-2xl mx-auto leading-relaxed">
                    Choose how you want to participate in Sierra Leone's agricultural revolution.
                </p>

                <div className="grid md:grid-cols-2 gap-8">
                    {/* Investor Card */}
                    <Link href="/register/investor" className="group block h-full">
                        <div className="glass hover:bg-white/5 border border-white/10 hover:border-blue-500/50 rounded-3xl p-10 transition duration-500 h-full flex flex-col items-center text-center relative overflow-hidden group-hover:shadow-[0_0_40px_rgba(59,130,246,0.3)]">
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition transform group-hover:scale-150 duration-700">
                                <span className="text-9xl">💼</span>
                            </div>
                            <div className="bg-blue-500/10 p-6 rounded-2xl mb-6 group-hover:scale-110 transition duration-300 border border-blue-500/20 shadow-lg shadow-blue-900/20">
                                <span className="text-5xl">💼</span>
                            </div>
                            <h2 className="text-3xl font-bold text-white mb-4">Become an Investor</h2>
                            <p className="text-gray-400 mb-8 flex-grow leading-relaxed">
                                Fund high-impact agricultural projects, earn returns, and track your portfolio with AI-driven insights.
                            </p>
                            <div className="bg-gradient-to-r from-blue-600 to-blue-700 group-hover:from-blue-500 group-hover:to-blue-600 text-white font-bold py-4 px-10 rounded-xl transition w-full shadow-lg shadow-blue-900/30">
                                Join as Investor &rarr;
                            </div>
                        </div>
                    </Link>

                    {/* Entrepreneur Card */}
                    <Link href="/register/entrepreneur" className="group block h-full">
                        <div className="glass hover:bg-white/5 border border-white/10 hover:border-green-500/50 rounded-3xl p-10 transition duration-500 h-full flex flex-col items-center text-center relative overflow-hidden group-hover:shadow-[0_0_40px_rgba(34,197,94,0.3)]">
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition transform group-hover:scale-150 duration-700">
                                <span className="text-9xl">🌱</span>
                            </div>
                            <div className="bg-green-500/10 p-6 rounded-2xl mb-6 group-hover:scale-110 transition duration-300 border border-green-500/20 shadow-lg shadow-green-900/20">
                                <span className="text-5xl">🌱</span>
                            </div>
                            <h2 className="text-3xl font-bold text-white mb-4">Raise Funds</h2>
                            <p className="text-gray-400 mb-8 flex-grow leading-relaxed">
                                Showcase your farm or agri-tech project to global investors, get verified, and access growth capital.
                            </p>
                            <div className="bg-gradient-to-r from-green-600 to-green-700 group-hover:from-green-500 group-hover:to-green-600 text-white font-bold py-4 px-10 rounded-xl transition w-full shadow-lg shadow-green-900/30">
                                Join as Entrepreneur &rarr;
                            </div>
                        </div>
                    </Link>
                </div>

                <p className="mt-16 text-gray-500">
                    Already have an account?{" "}
                    <Link href="/login" className="text-white font-bold hover:underline decoration-green-500 underline-offset-4">
                        Log in here
                    </Link>
                </p>
            </div>
        </div>
    );
}
