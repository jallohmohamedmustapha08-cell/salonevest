"use client";

export default function InvestorDashboard() {
    // Mock Data
    const isCertified = true;
    const portfolio = [
        {
            id: "1",
            title: "Kambia Cassava Farm",
            invested: 500,
            equity: "2%",
            date: "2024-12-15",
            status: "Active",
        },
        {
            id: "2",
            title: "Freetown Solar Tech",
            invested: 1200,
            equity: "5%",
            date: "2024-11-20",
            status: "Funded",
        },
    ];

    return (
        <div className="min-h-screen bg-gray-900 p-4 md:p-8 pb-20">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                            Investor Dashboard
                            {isCertified && (
                                <span className="bg-blue-900 text-blue-300 text-xs px-3 py-1 rounded-full border border-blue-700 flex items-center gap-1">
                                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                    Certified Investor
                                </span>
                            )}
                        </h1>
                        <p className="text-gray-400">Track your impact and returns.</p>
                    </div>
                    <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-full font-bold transition">
                        Browse Projects
                    </button>
                </div>

                {/* Stats Overview */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                    <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
                        <h3 className="text-gray-400 text-sm font-medium mb-2">Total Invested</h3>
                        <p className="text-3xl font-bold text-white">$1,700</p>
                        <span className="text-green-400 text-sm">+12% vs last month</span>
                    </div>
                    <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
                        <h3 className="text-gray-400 text-sm font-medium mb-2">Active Projects</h3>
                        <p className="text-3xl font-bold text-white">2</p>
                    </div>
                    <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
                        <h3 className="text-gray-400 text-sm font-medium mb-2">Est. ROI</h3>
                        <p className="text-3xl font-bold text-green-400">8.5%</p>
                    </div>
                </div>

                {/* Portfolio List */}
                <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
                    <div className="p-6 border-b border-gray-700">
                        <h2 className="text-xl font-bold text-white">Your Portfolio</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-gray-300">
                            <thead className="bg-gray-700/50 text-xs uppercase text-gray-400">
                                <tr>
                                    <th className="px-6 py-4">Project</th>
                                    <th className="px-6 py-4">Invested</th>
                                    <th className="px-6 py-4">Equity/Terms</th>
                                    <th className="px-6 py-4">Date</th>
                                    <th className="px-6 py-4">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-700">
                                {portfolio.map((item) => (
                                    <tr key={item.id} className="hover:bg-gray-700/30 transition">
                                        <td className="px-6 py-4 font-medium text-white">{item.title}</td>
                                        <td className="px-6 py-4 text-white">${item.invested.toLocaleString()}</td>
                                        <td className="px-6 py-4">{item.equity}</td>
                                        <td className="px-6 py-4">{item.date}</td>
                                        <td className="px-6 py-4">
                                            <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-900/50 text-green-400 border border-green-700">
                                                {item.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
