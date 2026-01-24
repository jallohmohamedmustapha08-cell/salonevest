'use client';

import { adminReleaseEscrow } from '@/app/actions/marketplace';
import { useState } from 'react';
import Image from 'next/image';

export default function AdminOrderCard({ order }: { order: any }) {
    const [loading, setLoading] = useState(false);

    const handleReleaseFunds = async () => {
        if (!confirm('Are you sure you want to release funds to the entrepreneur? This action cannot be undone.')) return;

        setLoading(true);
        const result = await adminReleaseEscrow(order.id);
        setLoading(false);

        if (result.error) {
            alert('Error: ' + result.error);
        } else {
            alert('Funds released successfully!');
        }
    };

    return (
        <div className="bg-white rounded-lg shadow overflow-hidden mb-4 border border-gray-200">
            <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50">
                <div>
                    <p className="text-sm font-medium text-gray-900">Order #{order.id.slice(0, 8)}</p>
                    <p className="text-xs text-gray-500">Created: {new Date(order.created_at).toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                    <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${order.status === 'Delivered' || order.status === 'Completed' ? 'bg-green-100 text-green-800' :
                            order.status === 'Shipped' ? 'bg-blue-100 text-blue-800' :
                                order.status === 'Dispute' ? 'bg-red-100 text-red-800' :
                                    'bg-yellow-100 text-yellow-800'
                        }`}>
                        {order.status}
                    </span>
                    <p className="text-xs text-gray-500 mt-1">Escrow: {order.escrow_status}</p>
                </div>
            </div>

            <div className="p-6">
                <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                        <h4 className="text-xs font-semibold text-gray-500 uppercase">Buyer</h4>
                        <p className="text-sm text-gray-900">{order.profiles?.full_name}</p>
                        <p className="text-xs text-gray-500">{order.profiles?.email}</p>
                    </div>
                    <div>
                        <h4 className="text-xs font-semibold text-gray-500 uppercase">Seller (Entrepreneur)</h4>
                        {/* Note: We need to fetch seller details. In getEntrepreneurOrders we fetch buyer. 
                 In admin view we should fetch both. Assuming the query includes it. */}
                        <p className="text-sm text-gray-900">{order.seller?.business_name || order.seller?.full_name || 'N/A'}</p>
                    </div>
                </div>

                <div className="space-y-2 mb-4">
                    {order.marketplace_order_items.map((item: any) => (
                        <div key={item.id} className="flex items-center text-sm">
                            <span className="font-medium">{item.quantity}x</span>
                            <span className="ml-2 flex-1">{item.marketplace_products?.title}</span>
                            <span>Le {item.price_at_purchase.toLocaleString()}</span>
                        </div>
                    ))}
                    <div className="border-t pt-2 flex justify-between font-bold">
                        <span>Total</span>
                        <span>Le {order.total_amount.toLocaleString()}</span>
                    </div>
                </div>

                <div className="flex justify-end border-t pt-4">
                    {order.escrow_status === 'Held' && (
                        <button
                            onClick={handleReleaseFunds}
                            disabled={loading}
                            className="px-4 py-2 bg-purple-600 text-white text-sm rounded hover:bg-purple-700 disabled:opacity-50"
                        >
                            {loading ? 'Processing...' : 'Release Funds'}
                        </button>
                    )}
                    {order.escrow_status === 'Released' && (
                        <span className="text-green-600 font-medium text-sm flex items-center">
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                            Funds Released
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}
