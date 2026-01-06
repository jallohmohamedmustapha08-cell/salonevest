"use client";

import { useState } from "react";

interface User {
    id: string; // UUID from Supabase
    name: string;
    email: string;
    role: string;
    status: string;
    type: string;
}

interface UserManagementProps {
    users: User[];
    handleUpgradeUser: (id: string) => void;
    handleBanUser: (id: string) => void;
    handleDeleteUser: (id: string) => void;
    onActionComplete?: () => void;
}

export default function UserManagement({ users, handleUpgradeUser, handleBanUser, handleDeleteUser, onActionComplete }: UserManagementProps) {

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold text-white">User Management</h2>
                <input type="text" placeholder="Search users..." className="bg-gray-800 border border-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:border-blue-500" />
            </div>
            <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden shadow-lg">
                <table className="w-full text-left text-gray-300">
                    <thead className="bg-gray-700/50 text-xs uppercase text-gray-400">
                        <tr>
                            <th className="px-6 py-4">Name</th>
                            <th className="px-6 py-4">Role</th>
                            <th className="px-6 py-4">Type</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                        {users.map((user) => (
                            <tr key={user.id} className="hover:bg-gray-700/30 transition">
                                <td className="px-6 py-4">
                                    <div className="font-medium text-white">{user.name}</div>
                                    <div className="text-xs text-gray-500">{user.email}</div>
                                </td>
                                <td className="px-6 py-4 capitalize">{user.role}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded text-xs font-bold ${user.type === 'Certified' ? 'bg-blue-900/50 text-blue-400' : 'bg-gray-700 text-gray-400'}`}>
                                        {user.type}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded text-xs font-bold ${user.status === 'Active' ? 'bg-green-900/50 text-green-400' : 'bg-red-900/50 text-red-400'}`}>
                                        {user.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 flex gap-2">
                                    {user.role === 'investor' && user.type !== 'Certified' && (
                                        <button onClick={() => handleUpgradeUser(user.id)} className="text-blue-400 hover:text-blue-300 text-sm font-bold">Verify</button>
                                    )}
                                    <button onClick={() => handleBanUser(user.id)} className="text-yellow-400 hover:text-yellow-300 text-sm font-bold">Ban</button>
                                    <button onClick={() => handleDeleteUser(user.id)} className="text-red-400 hover:text-red-300 text-sm font-bold">Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
