"use client";

import { useState } from "react";

interface Staff {
    id: any;
    name?: string;
    full_name?: string;
    role: string;
    region?: string;
    status?: string;
}

interface StaffManagementProps {
    staff: Staff[];
    showAddStaff: boolean;
    setShowAddStaff: (show: boolean) => void;
    handleDeleteStaff: (id: string) => void;
    onActionComplete?: () => void;
}

export default function StaffManagement({ staff, showAddStaff, setShowAddStaff, handleDeleteStaff, onActionComplete }: StaffManagementProps) {
    const [editingStaff, setEditingStaff] = useState<Staff | null>(null);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold text-white">Staff Management</h2>
                <button onClick={() => setShowAddStaff(!showAddStaff)} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-bold transition">
                    {showAddStaff ? "Cancel" : "+ Add New Staff"}
                </button>
            </div>

            {/* Add Staff Form */}
            {showAddStaff && (
                <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 mb-6 animate-fade-in">
                    <h3 className="text-xl font-bold text-white mb-4">Add New Staff Member</h3>
                    <form action={async (formData) => {
                        const result = await import("@/app/actions/create-staff").then(mod => mod.createStaffUser(formData));
                        if (result.error) {
                            alert(result.error);
                        } else {
                            alert("Staff member created successfully!");
                            setShowAddStaff(false);
                            if (onActionComplete) onActionComplete();
                        }
                    }}>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <input name="fullName" type="text" placeholder="Full Name" required className="bg-gray-700 border border-gray-600 text-white px-4 py-3 rounded-lg" />
                            <input name="email" type="email" placeholder="Email Address" required className="bg-gray-700 border border-gray-600 text-white px-4 py-3 rounded-lg" />
                            <input name="password" type="password" placeholder="Password" required className="bg-gray-700 border border-gray-600 text-white px-4 py-3 rounded-lg" />
                            <select name="role" required className="bg-gray-700 border border-gray-600 text-white px-4 py-3 rounded-lg">
                                <option value="staff">Staff (General)</option>
                                <option value="field_agent">Field Agent</option>
                                <option value="verifier">Verifier</option>
                                <option value="moderator">Moderator</option>
                                <option value="admin">Admin</option>
                            </select>
                            <input name="region" type="text" placeholder="Region (e.g. Bo)" className="bg-gray-700 border border-gray-600 text-white px-4 py-3 rounded-lg" />
                        </div>
                        <div className="mt-4 flex gap-4">
                            <button type="submit" className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-bold">Create Account</button>
                            <button type="button" onClick={() => setShowAddStaff(false)} className="bg-gray-600 hover:bg-gray-500 text-white px-6 py-3 rounded-lg font-bold">Cancel</button>
                        </div>
                    </form>
                </div>
            )}

            {/* Edit Staff Modal */}
            {editingStaff && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-gray-800 p-8 rounded-xl border border-gray-700 w-full max-w-2xl">
                        <h3 className="text-xl font-bold text-white mb-6">Edit Staff Member</h3>
                        <form action={async (formData) => {
                            const result = await import("@/app/actions/update-staff").then(mod => mod.updateStaffUser(formData));
                            if (result.error) {
                                alert(result.error);
                            } else {
                                alert("Staff updated successfully!");
                                setEditingStaff(null);
                                if (onActionComplete) onActionComplete();
                            }
                        }}>
                            <input type="hidden" name="id" value={editingStaff.id} />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-gray-400 mb-1 text-sm">Full Name</label>
                                    <input name="fullName" defaultValue={editingStaff.full_name || editingStaff.name} type="text" required className="w-full bg-gray-700 border border-gray-600 text-white px-4 py-3 rounded-lg" />
                                </div>
                                <div>
                                    <label className="block text-gray-400 mb-1 text-sm">Role</label>
                                    <select name="role" defaultValue={editingStaff.role} required className="w-full bg-gray-700 border border-gray-600 text-white px-4 py-3 rounded-lg">
                                        <option value="staff">Staff (General)</option>
                                        <option value="field_agent">Field Agent</option>
                                        <option value="verifier">Verifier</option>
                                        <option value="moderator">Moderator</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-gray-400 mb-1 text-sm">Region</label>
                                    <input name="region" defaultValue={editingStaff.region} type="text" className="w-full bg-gray-700 border border-gray-600 text-white px-4 py-3 rounded-lg" />
                                </div>
                                <div>
                                    <label className="block text-gray-400 mb-1 text-sm">Status</label>
                                    <select name="status" defaultValue={editingStaff.status || 'Active'} className="w-full bg-gray-700 border border-gray-600 text-white px-4 py-3 rounded-lg">
                                        <option value="Active">Active</option>
                                        <option value="Inactive">Inactive</option>
                                        <option value="Banned">Banned</option>
                                    </select>
                                </div>
                            </div>
                            <div className="mt-6 flex gap-4 justify-end">
                                <button type="button" onClick={() => setEditingStaff(null)} className="bg-gray-600 hover:bg-gray-500 text-white px-6 py-2 rounded-lg font-bold">Cancel</button>
                                <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-bold">Save Changes</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden shadow-lg">
                <table className="w-full text-left text-gray-300">
                    <thead className="bg-gray-700/50 text-xs uppercase text-gray-400">
                        <tr>
                            <th className="px-6 py-4">Name</th>
                            <th className="px-6 py-4">Role</th>
                            <th className="px-6 py-4">Region</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                        {staff.map((member) => (
                            <tr key={member.id} className="hover:bg-gray-700/30 transition">
                                <td className="px-6 py-4 font-medium text-white">{member.full_name || member.name || "N/A"}</td>
                                <td className="px-6 py-4 capitalize">{member.role.replace('_', ' ')}</td>
                                <td className="px-6 py-4">{member.region || "N/A"}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${member.status === 'Active' ? 'bg-green-900/50 text-green-400 border-green-700' : 'bg-red-900/50 text-red-400 border-red-700'
                                        }`}>
                                        {member.status || "Active"}
                                    </span>
                                </td>
                                <td className="px-6 py-4 flex gap-3">
                                    <button onClick={() => setEditingStaff(member)} className="text-blue-400 hover:text-blue-300 font-bold text-sm">Edit</button>
                                    <button onClick={() => handleDeleteStaff(member.id)} className="text-red-400 hover:text-red-300 text-sm">Remove</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
