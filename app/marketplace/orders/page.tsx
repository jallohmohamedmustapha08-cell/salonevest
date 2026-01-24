import { getUserOrders, confirmOrderReceipt } from '@/app/actions/marketplace';
import ConfirmReceiptButton from '@/components/marketplace/ConfirmReceiptButton'; // Extract button logic
import Link from 'next/link';
import Image from 'next/image';

export default async function UserOrdersPage() {
    const orders = await getUserOrders();

    return (
        <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">My Orders</h2>

            {orders.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg shadow">
                    <p className="text-gray-500 text-lg mb-4">You haven't placed any orders yet.</p>
                    <Link href="/marketplace" className="text-blue-600 hover:underline">
                        Start Shopping
                    </Link>
                </div>
            ) : (
                <div className="space-y-6">
                    {orders.map((order: any) => (
                        <div key={order.id} className="bg-white rounded-lg shadow overflow-hidden">
                            <div className="bg-gray-50 px-6 py-4 border-b flex justify-between items-center">
                                <div>
                                    <p className="text-sm text-gray-500">Order ID: <span className="font-mono text-gray-900">{order.id.slice(0, 8)}</span></p>
                                    <p className="text-sm text-gray-500">Date: {new Date(order.created_at).toLocaleDateString()}</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-gray-900">Total: Le {order.total_amount.toLocaleString()}</p>
                                    <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full mt-1 ${order.status === 'Delivered' || order.status === 'Completed' ? 'bg-green-100 text-green-800' :
                                            order.status === 'Shipped' ? 'bg-blue-100 text-blue-800' :
                                                order.status === 'Cancelled' ? 'bg-red-100 text-red-800' :
                                                    'bg-yellow-100 text-yellow-800'
                                        }`}>
                                        {order.status}
                                    </span>
                                </div>
                            </div>

                            <div className="p-6">
                                <div className="mb-4">
                                    <h4 className="text-sm font-medium text-gray-900 mb-2">Items from {order.profiles?.business_name || order.profiles?.full_name}</h4>
                                    <div className="space-y-3">
                                        {order.marketplace_order_items.map((item: any) => (
                                            <div key={item.id} className="flex items-center">
                                                <div className="h-12 w-12 bg-gray-200 rounded overflow-hidden relative flex-shrink-0">
                                                    {item.marketplace_products?.image_url && (
                                                        <Image src={item.marketplace_products.image_url} alt={item.marketplace_products.title} fill className="object-cover" />
                                                    )}
                                                </div>
                                                <div className="ml-4">
                                                    <p className="text-sm font-medium text-gray-900">{item.marketplace_products?.title}</p>
                                                    <p className="text-sm text-gray-500">Qty: {item.quantity} x Le {item.price_at_purchase.toLocaleString()}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {order.status === 'Shipped' && (
                                    <div className="mt-6 border-t pt-4 flex justify-between items-center">
                                        <div>
                                            <p className="text-sm text-gray-600">Estimated Delivery: {order.estimated_delivery_date ? new Date(order.estimated_delivery_date).toLocaleDateString() : 'Not set'}</p>
                                            <p className="text-xs text-blue-600 mt-1">Please confirm receipt once you have received the items.</p>
                                        </div>
                                        <ConfirmReceiptButton orderId={order.id} />
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
