"use client";

import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';

interface EntrepreneurChartsProps {
    projects: any[];
}

export default function EntrepreneurCharts({ projects }: EntrepreneurChartsProps) {

    const processFunding = () => {
        return projects.map(p => ({
            name: p.title.length > 15 ? p.title.substring(0, 15) + '...' : p.title,
            Funded: p.funding,
            Goal: p.goal
        })).slice(0, 5); // Show top 5 recent
    };

    const data = processFunding();

    if (projects.length === 0) return null;

    return (
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 mb-8">
            <h3 className="text-xl font-bold text-gray-800 mb-6">Project Funding Progress</h3>
            <div className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data} layout="vertical" margin={{ left: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#E5E7EB" />
                        <XAxis type="number" stroke="#9CA3AF" tickFormatter={(val) => `$${val}`} />
                        <YAxis dataKey="name" type="category" width={100} stroke="#4B5563" tick={{ fontSize: 12, fontWeight: 500 }} />
                        <Tooltip
                            cursor={{ fill: '#F3F4F6' }}
                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                            formatter={(value: number) => [`$${value.toLocaleString()}`, 'Amount']}
                        />
                        <Legend />
                        <Bar dataKey="Funded" fill="#10B981" radius={[0, 4, 4, 0]} barSize={20} />
                        <Bar dataKey="Goal" fill="#E5E7EB" radius={[0, 4, 4, 0]} barSize={20} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
