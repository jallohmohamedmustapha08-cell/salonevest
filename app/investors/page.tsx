export default function ExploreInvestors() {
    const investors = [
        {
            id: "1",
            name: "Diaspora Capital Group",
            type: "Certified Investor",
            interests: ["Agriculture", "Infrastructure"],
            minCheck: "$1,000",
            location: "London, UK",
        },
        {
            id: "2",
            name: "Salone Tech Ventures",
            type: "Certified Investor",
            interests: ["Tech", "Fintech"],
            minCheck: "$5,000",
            location: "Freetown, SL",
        },
        {
            id: "3",
            name: "Green Earth Fund",
            type: "Ordinary Investor",
            interests: ["Sustainable Farming", "Solar"],
            minCheck: "$500",
            location: "USA",
        },
    ];

    return (
        <div className="min-h-screen bg-gray-900 p-4 md:p-8 pb-20">
            <div className="max-w-6xl mx-auto">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-white mb-4">Find Investors</h1>
                    <p className="text-gray-400 max-w-2xl mx-auto">
                        Connect with certified investors and funds looking to support Sierra Leonean enterprises.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {investors.map((investor) => (
                        <div key={investor.id} className="bg-gray-800 rounded-xl border border-gray-700 p-6 hover:border-blue-500 transition shadow-lg">
                            <div className="flex justify-between items-start mb-4">
                                <div className="bg-blue-900/30 w-12 h-12 rounded-full flex items-center justify-center text-2xl">
                                    🏛️
                                </div>
                                {investor.type === "Certified Investor" && (
                                    <span className="bg-blue-900 text-blue-300 text-xs px-2 py-1 rounded-full border border-blue-700 flex items-center gap-1">
                                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                        Certified
                                    </span>
                                )}
                            </div>

                            <h3 className="text-xl font-bold text-white mb-2">{investor.name}</h3>
                            <p className="text-gray-400 text-sm mb-4 flex items-center gap-1">
                                📍 {investor.location}
                            </p>

                            <div className="space-y-3 mb-6">
                                <div>
                                    <span className="text-gray-500 text-xs uppercase font-bold">Interests</span>
                                    <div className="flex flex-wrap gap-2 mt-1">
                                        {investor.interests.map((interest) => (
                                            <span key={interest} className="bg-gray-700 text-gray-300 text-xs px-2 py-1 rounded">
                                                {interest}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <span className="text-gray-500 text-xs uppercase font-bold">Min Check Size</span>
                                    <p className="text-white font-medium">{investor.minCheck}</p>
                                </div>
                            </div>

                            <button className="w-full bg-transparent border border-blue-600 text-blue-400 hover:bg-blue-600 hover:text-white font-bold py-2 rounded-lg transition">
                                Connect
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
