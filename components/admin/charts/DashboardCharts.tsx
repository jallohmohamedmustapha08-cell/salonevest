"use client";

import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar,
    PieChart, Pie, Cell, Legend
} from 'recharts';
import { format, parseISO, startOfMonth, eachMonthOfInterval, subMonths } from 'date-fns';

interface DashboardChartsProps {
    users: any[];
    projects: any[];
    investments: any[];
}

const COLORS = ['#10B981', '#F59E0B', '#EF4444', '#3B82F6'];

export default function DashboardCharts({ users, projects, investments }: DashboardChartsProps) {

    // 1. User Growth (Last 6 Months)
    const processUserGrowth = () => {
        const today = new Date();
        const last6Months = eachMonthOfInterval({
            start: subMonths(today, 5),
            end: today
        });

        return last6Months.map(date => {
            const monthStr = format(date, 'MMM yyyy');
            // Count users created up to end of this month
            const count = users.filter(u => new Date(u.created_at || u.createdAt) <= new Date(date.getFullYear(), date.getMonth() + 1, 0)).length;
            return { name: monthStr, users: count };
        });
    };

    const userGrowthData = processUserGrowth();

    // 2. Investment Volume (By Project) - Top 5
    // Or maybe Volume over time? Let's do Volume over time for better trend analysis
    const processInvestmentVolume = () => {
        // Group by month
        const grouped: Record<string, number> = {};
        investments.forEach(inv => {
            if (!inv.created_at) return;
            const month = format(parseISO(inv.created_at), 'MMM');
            grouped[month] = (grouped[month] || 0) + Number(inv.amount);
        });

        // Convert to array
        return Object.keys(grouped).map(key => ({
            name: key,
            amount: grouped[key]
        })).slice(0, 6); // Just last few distinct months found
    };

    const investmentData = processInvestmentVolume();

    // 3. Project Status Distribution
    const processProjectStatus = () => {
        const counts = {
            Active: 0,
            Pending: 0,
            Completed: 0,
            Rejected: 0
        };
        projects.forEach(p => {
            const status = p.status as keyof typeof counts;
            if (counts[status] !== undefined) {
                counts[status]++;
            }
        });

        return Object.keys(counts).map(key => ({
            name: key,
            value: counts[key as keyof typeof counts]
        })).filter(item => item.value > 0);
    };

    const projectStatusData = processProjectStatus();

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">

            {/* User Growth Chart */}
            <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-lg">
                <h3 className="text-xl font-bold text-white mb-6">User Growth Trend</h3>
                <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={userGrowthData}>
                            <defs>
                                <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.8} />
                                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                            <XAxis dataKey="name" stroke="#9CA3AF" />
                            <YAxis stroke="#9CA3AF" />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px', color: '#fff' }}
                            />
                            <Area type="monotone" dataKey="users" stroke="#10B981" fillOpacity={1} fill="url(#colorUsers)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Project Status Distribution */}
            <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-lg">
                <h3 className="text-xl font-bold text-white mb-6">Project Status Distribution</h3>
                <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={projectStatusData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={100}
                                fill="#8884d8"
                                paddingAngle={5}
                                dataKey="value"
                                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                            >
                                {projectStatusData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px', color: '#fff' }}
                            />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Investment Volume */}
            <div className="col-span-1 lg:col-span-2 bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-lg">
                <h3 className="text-xl font-bold text-white mb-6">Recent Investment Volume</h3>
                {investmentData.length > 0 ? (
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={investmentData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                <XAxis dataKey="name" stroke="#9CA3AF" />
                                <YAxis stroke="#9CA3AF" />
                                <Tooltip
                                    cursor={{ fill: '#374151', opacity: 0.4 }}
                                    contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px', color: '#fff' }}
                                    formatter={(value: number) => [`$${value.toLocaleString()}`, 'Amount']}
                                />
                                <Bar dataKey="amount" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                ) : (
                    <div className="h-[300px] flex items-center justify-center text-gray-500">
                        No investment data available yet.
                    </div>
                )}
            </div>

        </div>
    );
}
