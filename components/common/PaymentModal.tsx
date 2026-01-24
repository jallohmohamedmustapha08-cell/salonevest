'use client';

import { useState } from 'react';

interface PaymentModalProps {
    amount: number;
    onClose: () => void;
    onConfirm: (paymentMethod: 'mobile_money' | 'crypto', txHash: string | null) => Promise<void>;
    isProcessing: boolean;
    title?: string;
}

export default function PaymentModal({ amount, onClose, onConfirm, isProcessing, title = "Confirm Payment" }: PaymentModalProps) {
    const [paymentMethod, setPaymentMethod] = useState<'mobile_money' | 'crypto'>('mobile_money');
    const [txHash, setTxHash] = useState("");
    const [isVerifying, setIsVerifying] = useState(false);

    const handleConfirm = async () => {
        if (paymentMethod === 'crypto') {
            if (!txHash) {
                alert("Please enter the Transaction Hash.");
                return;
            }
            setIsVerifying(true);
            // Dynamic import to avoid server-side issues if any
            const result = await import("@/app/actions/verify-crypto-transaction").then(mod => mod.verifyCryptoTransaction(txHash, amount));
            setIsVerifying(false);

            if (result.error) {
                alert("Verification Failed: " + result.error);
                return;
            }
            if (!result.success) {
                alert("Verification Failed: Unknown error.");
                return;
            }
            // Success
            await onConfirm('crypto', txHash);

        } else {
            // Mobile Money - Simulation always success for now
            await onConfirm('mobile_money', null);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 animate-fade-in">
            <div className="bg-gray-800 rounded-xl border border-gray-600 max-w-md w-full p-6 relative">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-white"
                >
                    ✕
                </button>

                <h2 className="text-2xl font-bold text-white mb-6">{title}</h2>

                <div className="mb-6">
                    <p className="text-gray-400 text-sm mb-2">Total Amount</p>
                    <p className="text-3xl font-bold text-green-400">Le {amount.toLocaleString()}</p>
                </div>

                <div className="mb-6">
                    <label className="block text-xs font-bold text-gray-400 mb-2">Payment Method</label>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setPaymentMethod('mobile_money')}
                            className={`flex-1 py-3 px-4 rounded-lg border font-bold text-sm transition flex items-center justify-center gap-2 ${paymentMethod === 'mobile_money' ? 'bg-blue-600/20 border-blue-500 text-blue-400' : 'bg-gray-700 border-gray-600 text-gray-400 hover:bg-gray-600'}`}
                        >
                            📱 Mobile Money
                        </button>
                        <button
                            onClick={() => setPaymentMethod('crypto')}
                            className={`flex-1 py-3 px-4 rounded-lg border font-bold text-sm transition flex items-center justify-center gap-2 ${paymentMethod === 'crypto' ? 'bg-purple-600/20 border-purple-500 text-purple-400' : 'bg-gray-700 border-gray-600 text-gray-400 hover:bg-gray-600'}`}
                        >
                            ₿ Crypto
                        </button>
                    </div>
                </div>

                {paymentMethod === 'crypto' && (
                    <div className="mb-6 bg-purple-900/20 p-4 rounded-lg border border-purple-500/30">
                        <p className="text-xs text-purple-300 mb-2 font-bold">1. Send USDT/MATIC (Polygon) to:</p>
                        <div className="bg-black/40 p-2 rounded border border-purple-500/20 flex items-center justify-between mb-4">
                            <code className="text-xs text-purple-200 break-all select-all">0x71C7656EC7ab88b098defB751B7401B5f6d8976F</code>
                            <button onClick={() => navigator.clipboard.writeText("0x71C7656EC7ab88b098defB751B7401B5f6d8976F")} className="text-xs text-purple-400 hover:text-white font-bold px-2">Copy</button>
                        </div>
                        <p className="text-xs text-purple-300 mb-2 font-bold">2. Enter Transaction Hash:</p>
                        <input
                            type="text"
                            placeholder="0x..."
                            value={txHash}
                            onChange={(e) => setTxHash(e.target.value)}
                            className="w-full bg-gray-900 border border-purple-500/30 rounded px-3 py-2 text-white text-xs focus:border-purple-500 outline-none"
                        />
                    </div>
                )}

                <button
                    onClick={handleConfirm}
                    disabled={isProcessing || isVerifying}
                    className={`w-full py-3 rounded-lg text-white font-bold shadow-lg disabled:opacity-50 transition transform hover:scale-105 ${paymentMethod === 'crypto' ? 'bg-purple-600 hover:bg-purple-700 shadow-purple-900/20' : 'bg-green-600 hover:bg-green-700 shadow-green-900/20'}`}
                >
                    {isProcessing ? "Processing..." : isVerifying ? "Verifying On-Chain..." : "Confirm Payment"}
                </button>
            </div>
        </div>
    );
}
