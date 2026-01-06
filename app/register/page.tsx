import Link from "next/link";

export default function Register() {
    return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4 py-20">
            <div className="max-w-4xl w-full text-center">
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
                    Join SaloneVest
                </h1>
                <p className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto">
                    Choose how you want to participate in Sierra Leone's agricultural revolution.
                </p>

                <div className="grid md:grid-cols-2 gap-8">
                    {/* Investor Card */}
                    <Link href="/register/investor" className="group block h-full">
                        <div className="bg-gray-800 hover:bg-gray-700 border-2 border-gray-700 hover:border-blue-500 rounded-2xl p-8 transition duration-300 h-full flex flex-col items-center text-center relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-10">
                                <span className="text-9xl">💼</span>
                            </div>
                            <div className="bg-blue-900/30 p-6 rounded-full mb-6 group-hover:scale-110 transition duration-300 z-10">
                                <span className="text-5xl">💼</span>
                            </div>
                            <h2 className="text-2xl font-bold text-white mb-4 z-10">Become an Investor</h2>
                            <p className="text-gray-400 mb-8 z-10 flex-grow">
                                Fund high-impact agricultural projects, earn returns, and track your portfolio.
                                <br />
                                <span className="text-blue-400 text-sm mt-2 block">
                                    *Certified Investor status available
                                </span>
                            </p>
                            <div className="bg-blue-600 group-hover:bg-blue-700 text-white font-bold py-4 px-8 rounded-full transition w-full z-10 shadow-lg">
                                Join as Investor
                            </div>
                        </div>
                    </Link>

                    {/* Entrepreneur Card */}
                    <Link href="/register/entrepreneur" className="group block h-full">
                        <div className="bg-gray-800 hover:bg-gray-700 border-2 border-gray-700 hover:border-green-500 rounded-2xl p-8 transition duration-300 h-full flex flex-col items-center text-center relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-10">
                                <span className="text-9xl">🌱</span>
                            </div>
                            <div className="bg-green-900/30 p-6 rounded-full mb-6 group-hover:scale-110 transition duration-300 z-10">
                                <span className="text-5xl">🌱</span>
                            </div>
                            <h2 className="text-2xl font-bold text-white mb-4 z-10">Raise Funds</h2>
                            <p className="text-gray-400 mb-8 z-10 flex-grow">
                                Showcase your farm or agri-tech project, get verified, and access capital.
                            </p>
                            <div className="bg-green-600 group-hover:bg-green-700 text-white font-bold py-4 px-8 rounded-full transition w-full z-10 shadow-lg">
                                Join as Entrepreneur
                            </div>
                        </div>
                    </Link>
                </div>

                <p className="mt-12 text-gray-500">
                    Already have an account?{" "}
                    <Link href="/login" className="text-white hover:underline">
                        Log in
                    </Link>
                </p>
            </div>
        </div>
    );
}
