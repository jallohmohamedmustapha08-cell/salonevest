"use client";

import { useState } from "react";
import { revertAgentVerification } from "@/app/actions/revert-verification";

interface VerificationLog {
    id: number;
    created_at: string;
    comment: string;
    proof_image_url: string | null;
    agent: {
        id: string;
        full_name: string;
        email: string;
        status: string;
    };
    verifier: {
        full_name: string;
        email: string;
    };
}

export default function AgentVerificationLog({ logs }: { logs: VerificationLog[] }) {
    const [loadingId, setLoadingId] = useState<number | null>(null);

    const handleRevert = async (logId: number, agentId: string) => {
        if (!confirm("Are you sure you want to revert this verification? The agent will return to 'Pending' status.")) return;

        setLoadingId(logId);
        const result = await revertAgentVerification(agentId);

        if (result.success) {
            alert("Verification reverted successfully.");
            // In a real app we might want to update the local state or trigger a refresh
            window.location.reload();
        } else {
            alert("Error: " + result.error);
        }
        setLoadingId(null);
    };

    return (
        <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
            <div className="p-6 border-b border-gray-700">
                <h2 className="text-xl font-bold text-white">Agent Verification History</h2>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-gray-700 text-gray-300">
                        <tr>
                            <th className="p-4">Date</th>
                            <th className="p-4">Agent</th>
                            <th className="p-4">Verified By</th>
                            <th className="p-4">Comment</th>
                            <th className="p-4">Proof</th>
                            <th className="p-4">Current Status</th>
                            <th className="p-4">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                        {logs.map((log) => (
                            <tr key={log.id} className="hover:bg-gray-700/50">
                                <td className="p-4 text-gray-400 text-sm">
                                    {new Date(log.created_at).toLocaleDateString()}
                                </td>
                                <td className="p-4">
                                    <div className="font-bold text-white">{log.agent?.full_name || 'Unknown'}</div>
                                    <div className="text-xs text-gray-500">{log.agent?.email}</div>
                                </td>
                                <td className="p-4">
                                    <div className="font-bold text-blue-400">{log.verifier?.full_name || 'Unknown'}</div>
                                    <div className="text-xs text-gray-500">{log.verifier?.email}</div>
                                </td>
                                <td className="p-4 text-gray-300 max-w-xs truncate" title={log.comment}>
                                    {log.comment}
                                </td>
                                <td className="p-4">
                                    {log.proof_image_url ? (
                                        <a href={log.proof_image_url} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline text-sm">
                                            View Image
                                        </a>
                                    ) : (
                                        <span className="text-gray-600 text-sm">None</span>
                                    )}
                                </td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${log.agent?.status === 'Verified' ? 'bg-green-900/40 text-green-400' : 'bg-yellow-900/40 text-yellow-400'
                                        }`}>
                                        {log.agent?.status || 'Pending'}
                                    </span>
                                </td>
                                <td className="p-4">
                                    {log.agent?.status === 'Verified' && (
                                        <button
                                            onClick={() => handleRevert(log.id, log.agent.id)}
                                            disabled={loadingId === log.id}
                                            className="text-red-400 hover:text-red-300 text-sm font-bold hover:underline disabled:opacity-50"
                                        >
                                            {loadingId === log.id ? "Reverting..." : "Revert"}
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                        {logs.length === 0 && (
                            <tr>
                                <td colSpan={7} className="p-8 text-center text-gray-500">
                                    No verification history found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
