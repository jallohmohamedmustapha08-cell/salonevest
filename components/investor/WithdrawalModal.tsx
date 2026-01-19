"use client";

import { useState } from "react";
import { requestWithdrawal } from "@/app/actions/financials";

interface WithdrawalModalProps {
    userId: string;
    availableBalance: number;
    onClose: () => void;
    onSuccess: () => void;
}

export default function WithdrawalModal({ userId, availableBalance, onClose, onSuccess }: WithdrawalModalProps) {
    const [amount, setAmount] = useState<number>(0);
    const [method, setMethod] = useState("crypto");
    const [details, setDetails] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (amount <= 0) return setError("Amount must be greater than 0");
        if (amount > availableBalance) return setError("Insufficient funds");
        if (!details) return setError("Please provide payment details");

        setLoading(true);

        const result = await requestWithdrawal(userId, amount, method, details);

        if (result.success) {
            onSuccess();
            onClose();
        } else {
            setError(result.error || "Failed to submit request");
        }
        setLoading(false);
    };

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-gray-900 rounded-2xl w-full max-w-md border border-gray-700 shadow-2xl relative overflow-hidden">
                <div className="p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold text-white">Withdraw Funds</h2>
                        <button onClick={onClose} className="text-gray-400 hover:text-white transition">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                        </button>
                    </div>

                    <div className="bg-gray-800 p-4 rounded-lg mb-6 border border-gray-700">
                        <span className="text-gray-400 text-sm">Available Balance</span>
                        <div className="text-2xl font-bold text-green-400">${availableBalance.toLocaleString()}</div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-gray-400 text-sm font-bold mb-2">Amount ($)</label>
                            <input
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(Number(e.target.value))}
                                className="w-full bg-black/30 border border-gray-600 text-white rounded-lg px-4 py-3 focus:border-green-500 focus:outline-none transition"
                                placeholder="0.00"
                                min="1"
                                max={availableBalance}
                            />
                        </div>

                        <div>
                            <label className="block text-gray-400 text-sm font-bold mb-2">Withdrawal Method</label>
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    type="button"
                                    onClick={() => setMethod("crypto")}
                                    className={`py-2 px-4 rounded-lg border text-sm font-bold transition flex flex-col items-center justify-center gap-1 ${method === "crypto" ? "bg-green-600 border-green-500 text-white" : "bg-gray-800 border-gray-700 text-gray-400 hover:bg-gray-700"}`}
                                >
                                    <span>💎 Crypto (USDT)</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setMethod("mobile_money")}
                                    className={`py-2 px-4 rounded-lg border text-sm font-bold transition flex flex-col items-center justify-center gap-1 ${method === "mobile_money" ? "bg-orange-600 border-orange-500 text-white" : "bg-gray-800 border-gray-700 text-gray-400 hover:bg-gray-700"}`}
                                >
                                    <span>📱 Mobile Money</span>
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="block text-gray-400 text-sm font-bold mb-2">
                                {method === "crypto" ? "Wallet Address (Polygon/BSC)" : "Phone Number (+232...)"}
                            </label>
                            <input
                                type="text"
                                value={details}
                                onChange={(e) => setDetails(e.target.value)}
                                className="w-full bg-black/30 border border-gray-600 text-white rounded-lg px-4 py-3 focus:border-green-500 focus:outline-none transition"
                                placeholder={method === "crypto" ? "0x..." : "+232 77 000000"}
                            />
                        </div>

                        {error && (
                            <div className="bg-red-900/50 border border-red-500/50 text-red-200 text-sm p-3 rounded-lg">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading || amount <= 0 || !details}
                            className={`w-full py-3 rounded-lg font-bold text-lg shadow-lg ${loading ? "bg-gray-600 cursor-not-allowed" : "bg-green-500 hover:bg-green-600 text-black cursor-pointer transform hover:scale-[1.02] transition"}`}
                        >
                            {loading ? "Processing..." : "Request Withdrawal"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
