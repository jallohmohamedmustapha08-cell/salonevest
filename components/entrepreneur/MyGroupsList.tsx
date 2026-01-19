"use client";

import { useEffect, useState } from "react";
import { getUserGroups } from "@/app/actions/groups";

export default function MyGroupsList({ userId }: { userId: string }) {
    const [groups, setGroups] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!userId) return;
        const fetchGroups = async () => {
            const { success, groups } = await getUserGroups(userId);
            if (success && groups) {
                setGroups(groups);
            }
            setLoading(false);
        };
        fetchGroups();
    }, [userId]);

    if (loading) return <div className="text-gray-400 text-sm">Loading groups...</div>;

    if (groups.length === 0) {
        return (
            <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 text-center">
                <p className="text-gray-400 text-sm">You haven't joined any groups yet.</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {groups.map((group) => (
                <div key={group.id} className="bg-gray-800 p-5 rounded-lg border border-gray-700 shadow-sm hover:border-blue-500 transition">
                    <div className="flex justify-between items-start mb-2">
                        <h3 className="font-bold text-lg text-white">{group.name}</h3>
                        <span className="bg-blue-900/40 text-blue-300 text-xs px-2 py-1 rounded font-bold">
                            Score: {group.joint_liability_score}
                        </span>
                    </div>
                    <p className="text-gray-400 text-sm mb-3">📍 {group.location}</p>
                    <div className="text-xs text-gray-500">
                        Is Leader: <span className={group.leader_id === userId ? "text-green-400 font-bold" : "text-gray-400"}>
                            {group.leader_id === userId ? "Yes" : "No"}
                        </span>
                    </div>
                </div>
            ))}
        </div>
    );
}
