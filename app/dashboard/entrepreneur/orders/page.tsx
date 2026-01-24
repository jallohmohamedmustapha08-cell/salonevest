import { getEntrepreneurOrders } from '@/app/actions/marketplace';
import EntrepreneurOrderCard from '@/components/marketplace/EntrepreneurOrderCard';

export default async function EntrepreneurOrdersPage() {
    const orders = await getEntrepreneurOrders();

    return (
        <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Manage Orders</h2>

            {orders.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg shadow">
                    <p className="text-gray-500">No orders received yet.</p>
                </div>
            ) : (
                <div>
                    {orders.map((order: any) => (
                        <EntrepreneurOrderCard key={order.id} order={order} />
                    ))}
                </div>
            )}
        </div>
    );
}
