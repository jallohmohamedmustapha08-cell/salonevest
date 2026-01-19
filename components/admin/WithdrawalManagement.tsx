
import { useState } from "react";
import { approveWithdrawal } from "@/app/actions/financials";

interface WithdrawalRequest {
    id: string;
    user_id: string;
    amount: number;
    method: string;
    details: string;
    status: 'pending' | 'approved' | 'rejected';
    created_at: string;
    user?: {
        full_name: string;
        email: string;
    };
}

interface WithdrawalManagementProps {
    requests: WithdrawalRequest[];
    onActionComplete: () => void;
}

export default function WithdrawalManagement({ requests, onActionComplete }: WithdrawalManagementProps) {
    const [filter, setFilter] = useState<'pending' | 'approved' | 'all'>('pending');
    const [processingId, setProcessingId] = useState<string | null>(null);

    const filteredRequests = requests.filter(r => {
        if (filter === 'all') return true;
        return r.status === filter;
    });

    const handleApprove = async (request: WithdrawalRequest) => {
        if (!confirm(`Approve withdrawal of $${request.amount} for ${request.user?.full_name || 'User'}?`)) return;

        setProcessingId(request.id);

        // Get Admin ID (Client side fetch or pass as prop ideally, but let's fetch)
        const { data: { user } } = await import("@/lib/supabaseClient").then(mod => mod.supabase.auth.getUser());
        if (!user) {
            alert("Unauthorized");
            setProcessingId(null);
            return;
        }

        const result = await approveWithdrawal(request.id, user.id);

        if (result.success) {
            alert("Withdrawal Approved! Funds deducted from user wallet.");
            onActionComplete();
        } else {
            alert("Error: " + result.error);
        }
        setProcessingId(null);
    };

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold text-white">Withdrawal Requests</h2>

            <div className="flex gap-4 mb-6">
                <button
                    onClick={() => setFilter('pending')}
                    className={`px-4 py-2 rounded-lg font-bold transition ${filter === 'pending' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'}`}
                >
                    Pending
                </button>
                <button
                    onClick={() => setFilter('approved')}
                    className={`px-4 py-2 rounded-lg font-bold transition ${filter === 'approved' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'}`}
                >
                    Approved
                </button>
                <button
                    onClick={() => setFilter('all')}
                    className={`px-4 py-2 rounded-lg font-bold transition ${filter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'}`}
                >
                    All History
                </button>
            </div>

            <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
                {filteredRequests.length === 0 ? (
                    <div className="p-10 text-center text-gray-500">
                        No {filter} withdrawal requests found.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-900/50 text-gray-400 text-xs uppercase border-b border-gray-700">
                                    <th className="p-4">User</th>
                                    <th className="p-4">Amount</th>
                                    <th className="p-4">Method</th>
                                    <th className="p-4">Details</th>
                                    <th className="p-4">Date</th>
                                    <th className="p-4">Status</th>
                                    <th className="p-4">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-700">
                                {filteredRequests.map(req => (
                                    <tr key={req.id} className="hover:bg-gray-700/30 transition text-sm">
                                        <td className="p-4 text-white font-bold">
                                            {req.user?.full_name || 'Unknown'}
                                            <span className="block text-xs text-gray-500 font-normal">{req.user?.email}</span>
                                        </td>
                                        <td className="p-4 text-green-400 font-bold font-mono">
                                            ${req.amount.toLocaleString()}
                                        </td>
                                        <td className="p-4 text-gray-300 capitalize">
                                            {req.method.replace('_', ' ')}
                                        </td>
                                        <td className="p-4 text-gray-400 font-mono text-xs max-w-[200px] truncate" title={req.details}>
                                            {req.details}
                                        </td>
                                        <td className="p-4 text-gray-500 text-xs">
                                            {new Date(req.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${req.status === 'pending' ? 'bg-yellow-900/50 text-yellow-500' :
                                                    req.status === 'approved' ? 'bg-green-900/50 text-green-500' :
                                                        'bg-red-900/50 text-red-500'
                                                }`}>
                                                {req.status}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            {req.status === 'pending' && (
                                                <button
                                                    onClick={() => handleApprove(req)}
                                                    disabled={processingId === req.id}
                                                    className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded text-xs font-bold transition disabled:opacity-50"
                                                >
                                                    {processingId === req.id ? '...' : 'Approve'}
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
