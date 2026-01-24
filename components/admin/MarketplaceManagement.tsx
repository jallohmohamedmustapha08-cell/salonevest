'use client';

import { useState } from 'react';
import { adminReleaseEscrow } from '@/app/actions/marketplace';

interface MarketplaceManagementProps {
    orders: any[];
    onActionComplete: () => void;
}

export default function MarketplaceManagement({ orders, onActionComplete }: MarketplaceManagementProps) {
    const [loadingId, setLoadingId] = useState<string | null>(null);

    const handleReleaseFunds = async (orderId: string) => {
        if (!confirm('Are you sure you want to release funds to the entrepreneur? This action cannot be undone.')) return;

        setLoadingId(orderId);
        const result = await adminReleaseEscrow(orderId);
        setLoadingId(null);

        if (result.error) {
            alert('Error: ' + result.error);
        } else {
            alert('Funds released successfully!');
            onActionComplete();
        }
    };

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold text-white">Marketplace Escrow Management</h2>

            <div className="grid gap-6">
                {orders.length === 0 ? (
                    <div className="bg-gray-800 p-8 rounded-xl border border-gray-700 text-center text-gray-500">
                        No orders found.
                    </div>
                ) : (
                    orders.map((order) => (
                        <div key={order.id} className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden shadow-lg">
                            <div className="p-6 border-b border-gray-700 flex justify-between items-start">
                                <div>
                                    <div className="flex items-center gap-3 mb-1">
                                        <h3 className="text-lg font-bold text-white">Order #{order.id.slice(0, 8)}</h3>
                                        <span className={`px-2 py-1 text-xs rounded font-bold uppercase ${order.status === 'Delivered' || order.status === 'Completed' ? 'bg-green-900/30 text-green-400' :
                                                order.status === 'Shipped' ? 'bg-blue-900/30 text-blue-400' :
                                                    order.status === 'Dispute' ? 'bg-red-900/30 text-red-400' :
                                                        'bg-yellow-900/30 text-yellow-400'
                                            }`}>
                                            {order.status}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-400">Placed on {new Date(order.created_at).toLocaleDateString()}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm text-gray-400">Escrow Status</p>
                                    <p className={`font-bold ${order.escrow_status === 'Released' ? 'text-green-400' : 'text-yellow-400'
                                        }`}>
                                        {order.escrow_status}
                                    </p>
                                </div>
                            </div>

                            <div className="p-6 grid md:grid-cols-2 gap-6">
                                <div>
                                    <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Buyer</h4>
                                    <p className="text-white">{order.profiles?.full_name || order.profiles?.email}</p>
                                    <p className="text-sm text-gray-400">{order.shipping_address}</p>
                                </div>
                                <div>
                                    <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Seller</h4>
                                    <p className="text-white">{order.seller?.business_name || order.seller?.full_name || 'Unknown'}</p>
                                </div>
                            </div>

                            <div className="px-6 pb-6">
                                <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Items</h4>
                                <div className="bg-gray-900/50 rounded-lg p-4 space-y-2">
                                    {order.marketplace_order_items?.map((item: any) => (
                                        <div key={item.id} className="flex justify-between text-sm">
                                            <span className="text-gray-300">
                                                <span className="font-bold text-white">{item.quantity}x</span> {item.marketplace_products?.title}
                                            </span>
                                            <span className="text-gray-400">Le {item.price_at_purchase.toLocaleString()}</span>
                                        </div>
                                    ))}
                                    <div className="border-t border-gray-700 pt-2 mt-2 flex justify-between font-bold text-white">
                                        <span>Total</span>
                                        <span>Le {order.total_amount.toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gray-900/30 p-4 flex justify-end">
                                {order.escrow_status === 'Held' && (
                                    <button
                                        onClick={() => handleReleaseFunds(order.id)}
                                        disabled={loadingId === order.id}
                                        className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-bold transition disabled:opacity-50 flex items-center gap-2"
                                    >
                                        {loadingId === order.id ? 'Processing...' : 'Release Funds to Seller'}
                                    </button>
                                )}
                                {order.escrow_status === 'Released' && (
                                    <span className="text-green-400 font-bold flex items-center gap-2">
                                        ✓ Funds Released
                                    </span>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
