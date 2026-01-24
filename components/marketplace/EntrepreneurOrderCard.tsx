'use client';

import { updateOrderStatus, requestFundsRelease } from '@/app/actions/marketplace';
import { useState } from 'react';
import Image from 'next/image';

export default function EntrepreneurOrderCard({ order }: { order: any }) {
    const [loading, setLoading] = useState(false);
    const [showShipModal, setShowShipModal] = useState(false);
    const [estDate, setEstDate] = useState('');

    const handleMarkShipped = async () => {
        if (!estDate) {
            alert('Please select an estimated delivery date.');
            return;
        }

        setLoading(true);
        const result = await updateOrderStatus(order.id, 'Shipped', new Date(estDate).toISOString());
        setLoading(false);
        setShowShipModal(false);

        if (result.error) {
            alert('Error: ' + result.error);
        } else {
            alert('Order marked as shipped!');
        }
    };

    const handleRequestRelease = async () => {
        if (!confirm('Are you sure? Only request this if 7 days have passed since the estimated delivery date.')) return;

        setLoading(true);
        const result = await requestFundsRelease(order.id);
        setLoading(false);

        if (result.error) {
            alert('Error: ' + result.error);
        } else {
            alert('Funds release requested. Admin will review.');
        }
    };

    // Check if 7 days passed since est delivery
    const canRequestRelease = order.status === 'Shipped' && order.estimated_delivery_date &&
        (new Date().getTime() - new Date(order.estimated_delivery_date).getTime() > 7 * 24 * 60 * 60 * 1000);

    return (
        <div className="bg-white rounded-lg shadow overflow-hidden mb-4">
            <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50">
                <div>
                    <p className="text-sm font-medium text-gray-900">Order #{order.id.slice(0, 8)}</p>
                    <p className="text-sm text-gray-500">Buyer: {order.profiles?.full_name}</p>
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
                <div className="space-y-3 mb-6">
                    {order.marketplace_order_items.map((item: any) => (
                        <div key={item.id} className="flex items-center">
                            <div className="h-10 w-10 bg-gray-200 rounded overflow-hidden relative flex-shrink-0">
                                {item.marketplace_products?.image_url && (
                                    <Image src={item.marketplace_products.image_url} alt={item.marketplace_products.title} fill className="object-cover" />
                                )}
                            </div>
                            <div className="ml-3">
                                <p className="text-sm font-medium text-gray-900">{item.marketplace_products?.title}</p>
                                <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="flex justify-between items-center border-t pt-4">
                    <div className="text-sm text-gray-500">
                        {order.estimated_delivery_date && (
                            <p>Est. Delivery: {new Date(order.estimated_delivery_date).toLocaleDateString()}</p>
                        )}
                    </div>

                    <div className="space-x-2">
                        {order.status === 'Pending' || order.status === 'Paid' ? (
                            <>
                                <button
                                    onClick={() => setShowShipModal(true)}
                                    disabled={loading}
                                    className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                                >
                                    Mark Shipped
                                </button>
                            </>
                        ) : null}

                        {canRequestRelease && order.status !== 'Dispute' && order.status !== 'Completed' && (
                            <button
                                onClick={handleRequestRelease}
                                disabled={loading}
                                className="px-3 py-1 bg-orange-600 text-white text-sm rounded hover:bg-orange-700"
                            >
                                Request Release
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {showShipModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-xl w-96">
                        <h3 className="text-lg font-medium mb-4">Mark Order as Shipped</h3>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Estimated Delivery Date</label>
                        <input
                            type="date"
                            value={estDate}
                            onChange={(e) => setEstDate(e.target.value)}
                            className="w-full border rounded p-2 mb-4"
                        />
                        <div className="flex justify-end space-x-2">
                            <button
                                onClick={() => setShowShipModal(false)}
                                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleMarkShipped}
                                disabled={loading}
                                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                            >
                                Confirm
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
