"use client";

import { useState, useEffect } from "react";
import { approvePayout, getPendingPayouts } from "@/app/actions/payouts";
import { supabase } from "@/lib/supabaseClient";

export default function GroupApprovals() {
    const [payouts, setPayouts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [userId, setUserId] = useState<string | null>(null);
    // const supabase = createClientComponentClient(); -> using imported supabase based on project pattern

    useEffect(() => {
        const fetchPayouts = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setUserId(user.id);
                const res = await getPendingPayouts(user.id);
                if (res.success && res.payouts) {
                    setPayouts(res.payouts);
                }
            }
            setLoading(false);
        };
        fetchPayouts();
    }, []);

    const handleApprove = async (payoutId: string) => {
        if (!userId) return;
        const confirmApprove = window.confirm("Do you approve this payout release?");
        if (!confirmApprove) return;

        const res = await approvePayout(payoutId, userId);
        if (res.success) {
            alert(res.message);
            setPayouts(prev => prev.filter(p => p.id !== payoutId));
        } else {
            alert("Error: " + res.error);
        }
    };

    if (loading) return <div className="p-4 text-sm text-gray-500">Loading approvals...</div>;
    if (payouts.length === 0) return null; // Don't show if empty

    return (
        <div className="bg-white p-6 rounded-xl shadow-md border border-yellow-200 mb-8">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                👥 Pending Group Approvals
                <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">{payouts.length}</span>
            </h3>
            <p className="text-sm text-gray-600 mb-4">
                Your group members requested funds. As a co-guarantor, your approval is required.
            </p>

            <div className="space-y-4">
                {payouts.map((payout) => (
                    <div key={payout.id} className="flex flex-col md:flex-row justify-between items-center bg-gray-50 p-4 rounded-lg border border-gray-200">
                        <div className="mb-3 md:mb-0">
                            <p className="font-bold text-gray-800">{payout.project?.title || "Project Funding"}</p>
                            <p className="text-xs text-gray-500">
                                Group: <span className="font-semibold">{payout.groupName}</span> • Amount: <span className="font-bold text-green-600">${payout.amount}</span>
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                                Current Approvals: {payout.approvals?.length || 0}/2 required
                            </p>
                        </div>
                        <button
                            onClick={() => handleApprove(payout.id)}
                            className="bg-green-600 hover:bg-green-700 text-white text-sm font-bold py-2 px-4 rounded shadow-sm transition"
                        >
                            ✅ Approve
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}
