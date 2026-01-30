"use client";

import {
    PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
    AreaChart, Area, XAxis, YAxis, CartesianGrid
} from 'recharts';
import { format, parseISO } from 'date-fns';

interface InvestorChartsProps {
    investments: any[];
}

const COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6'];

export default function InvestorCharts({ investments }: InvestorChartsProps) {

    // 1. Portfolio Distribution (By Project/Sector)
    const processPortfolio = () => {
        const grouped: Record<string, number> = {};
        investments.forEach(inv => {
            // Use project title or 'Unknown'
            // Assuming inv.project might be populated
            const name = inv.project?.title || 'Unknown Project';
            grouped[name] = (grouped[name] || 0) + Number(inv.amount);
        });

        return Object.keys(grouped).map(key => ({
            name: key,
            value: grouped[key]
        }));
    };

    const portfolioData = processPortfolio();

    // 2. Investment History (Cumulative)
    const processHistory = () => {
        // Sort by date
        const sorted = [...investments].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

        let cumulative = 0;
        return sorted.map(inv => {
            cumulative += Number(inv.amount);
            return {
                date: format(parseISO(inv.created_at), 'MMM d, yyyy'),
                amount: cumulative,
                daily: Number(inv.amount)
            };
        });
    };

    const historyData = processHistory();

    if (investments.length === 0) return null;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Portfolio Distribution */}
            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
                <h3 className="text-xl font-bold text-gray-800 mb-6">Portfolio Allocation</h3>
                <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={portfolioData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={100}
                                fill="#8884d8"
                                paddingAngle={5}
                                dataKey="value"
                                label={({ name, percent }) => `${((percent || 0) * 100).toFixed(0)}%`}
                            >
                                {portfolioData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip formatter={(value: number | undefined) => [`$${(value || 0).toLocaleString()}`, 'Invested']} />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Investment History */}
            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
                <h3 className="text-xl font-bold text-gray-800 mb-6">Investment Growth</h3>
                <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={historyData}>
                            <defs>
                                <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.8} />
                                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                            <XAxis dataKey="date" stroke="#9CA3AF" tick={{ fontSize: 12 }} />
                            <YAxis stroke="#9CA3AF" tick={{ fontSize: 12 }} tickFormatter={(val) => `$${val}`} />
                            <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
                            <Area type="monotone" dataKey="amount" stroke="#10B981" fillOpacity={1} fill="url(#colorAmount)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}
