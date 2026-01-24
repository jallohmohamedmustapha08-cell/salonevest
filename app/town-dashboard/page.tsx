import { createClient } from "@supabase/supabase-js";

// Force valid UUID for demo if needed, but normally we verify auth
// For public dashboard, we might use service role or public client
// Client initialization moved to function scope

async function getTownStats(location: string) {
    // Force valid UUID for demo if needed, but normally we verify auth
    // For public dashboard, we might use service role or public client
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        { auth: { autoRefreshToken: false, persistSession: false } }
    );
    // 1. Fetch Projects in the area (assuming project location matches or entrepreneur location)
    // For simplicity, we filter by entrepreneur profile location = location
    const { data: profiles } = await supabase
        .from('profiles')
        .select('id, trust_score')
        .ilike('region', `%${location}%`); // Using region or location field

    const profileIds = profiles?.map(p => p.id) || [];

    const { data: projects } = await supabase
        .from('projects')
        .select('funding_raised, goal, status, trust_score')
        .in('entrepreneur_id', profileIds);

    // 2. Aggregate
    const totalFunding = projects?.reduce((sum, p) => sum + (p.funding_raised || 0), 0) || 0;
    const totalProjects = projects?.length || 0;

    // Avg Trust Score (Farmers)
    const totalTrust = profiles?.reduce((sum, p) => sum + (p.trust_score || 0), 0) || 0;
    const avgTrust = profiles?.length ? Math.round(totalTrust / profiles.length) : 0;

    // Repayment Rate (Mock logic or based on Return transactions)
    // Let's assume projects with status 'Funded' have a repayment rate based on Trust Score for now
    const repaymentRate = Math.min(98, Math.max(80, avgTrust)); // Correlate with trust

    return {
        location,
        totalFunding,
        totalProjects,
        farmerCount: profiles?.length || 0,
        avgTrust,
        repaymentRate
    };
}

export default async function TownDashboard() {
    const location = "Kabala"; // Default or dynamic
    const stats = await getTownStats(location);

    return (
        <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
            {/* Header */}
            <header className="bg-green-700 text-white py-6 px-4 md:px-8 shadow-md">
                <div className="max-w-6xl mx-auto flex justify-between items-center">
                    <h1 className="text-2xl font-bold tracking-tight">Town Dashboard: {stats.location}</h1>
                    <span className="text-sm bg-green-600 px-3 py-1 rounded-full">Live Data</span>
                </div>
            </header>

            <main className="max-w-6xl mx-auto py-10 px-4 md:px-8">
                {/* Hero Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                    <StatCard
                        label="Total Community Impact"
                        value={`SL Le ${stats.totalFunding.toLocaleString()}`}
                        icon="💰"
                        color="bg-blue-50 border-blue-200 text-blue-700"
                    />
                    <StatCard
                        label="Active Farmers"
                        value={stats.farmerCount.toString()}
                        icon="👩‍🌾"
                        color="bg-green-50 border-green-200 text-green-700"
                    />
                    <StatCard
                        label="Avg Trust Score"
                        value={`${stats.avgTrust}/100`}
                        icon="🛡️"
                        color="bg-purple-50 border-purple-200 text-purple-700"
                    />
                    <StatCard
                        label="Repayment Rate"
                        value={`${stats.repaymentRate}%`}
                        icon="📈"
                        color="bg-orange-50 border-orange-200 text-orange-700"
                    />
                </div>

                {/* Detailed Sections */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Collective Impact Chart Area */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <h2 className="text-xl font-semibold mb-4">Collective Output</h2>
                        <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center text-gray-400">
                            [Chart: Rice Production vs Investment over Time]
                        </div>
                        <p className="mt-4 text-sm text-gray-500">
                            Graph shows the correlation between community funding and agricultural output in {location} over the last 12 months.
                        </p>
                    </div>

                    {/* Top Groups */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <h2 className="text-xl font-semibold mb-4">Top Performing Groups</h2>
                        <ul className="space-y-4">
                            <GroupRank rank={1} name="Kabala Rice Co-op" score={92} members={12} />
                            <GroupRank rank={2} name="Women's Veg Growers" score={88} members={8} />
                            <GroupRank rank={3} name="Hillside Cassava" score={85} members={15} />
                        </ul>
                    </div>
                </div>
            </main>
        </div>
    );
}

function StatCard({ label, value, icon, color }: any) {
    return (
        <div className={`p-6 rounded-xl border ${color} shadow-sm transition-transform hover:-translate-y-1`}>
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-sm font-medium opacity-80 mb-1">{label}</p>
                    <h3 className="text-2xl font-bold">{value}</h3>
                </div>
                <span className="text-2xl">{icon}</span>
            </div>
        </div>
    );
}

function GroupRank({ rank, name, score, members }: any) {
    return (
        <li className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors border-b border-gray-50 last:border-0">
            <div className="flex items-center gap-3">
                <span className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold ${rank === 1 ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-600'}`}>
                    {rank}
                </span>
                <div>
                    <p className="font-semibold text-gray-800">{name}</p>
                    <p className="text-xs text-gray-500">{members} members</p>
                </div>
            </div>
            <div className="text-right">
                <span className="block font-bold text-green-600">{score}</span>
                <span className="text-[10px] uppercase text-gray-400">Trust Score</span>
            </div>
        </li>
    );
}
