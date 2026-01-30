"use client";

import DashboardCharts from "./charts/DashboardCharts";

interface OverviewProps {
    stats: { label: string; value: string; change: string }[];
    users?: any[];
    projects?: any[];
    investments?: any[];
}

export default function Overview({ stats, users = [], projects = [], investments = [] }: OverviewProps) {
    return (
        <div className="space-y-8">
            <h2 className="text-3xl font-bold text-white">Dashboard Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, index) => (
                    <div key={index} className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-lg">
                        <h3 className="text-gray-400 text-sm font-medium mb-2">{stat.label}</h3>
                        <div className="flex items-end justify-between">
                            <span className="text-3xl font-bold text-white">{stat.value}</span>
                            <span className={`text-sm font-bold ${stat.change.startsWith("+") ? "text-green-400" : "text-red-400"}`}>
                                {stat.change}
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Charts Section */}
            <DashboardCharts users={users} projects={projects} investments={investments} />
        </div>
    );
}
