import { createClient } from '@/utils/supabase/server';
import AdminOrderCard from '@/components/marketplace/AdminOrderCard';

export default async function AdminMarketplacePage() {
    const supabase = await createClient();

    // Fetch all orders with buyer and seller details
    // Note: 'seller' is entrepreneur_id relation. We need to alias it or use the correct relation name.
    // In schema, entrepreneur_id references profiles.

    const { data: orders, error } = await supabase
        .from('marketplace_orders')
        .select(`
      *,
      marketplace_order_items (
        *,
        marketplace_products (title)
      ),
      profiles!buyer_id (full_name, email),
      seller:profiles!entrepreneur_id (full_name, business_name)
    `)
        .order('created_at', { ascending: false });

    if (error) {
        console.error("Error fetching admin orders:", error);
        return <div>Error loading orders.</div>;
    }

    return (
        <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Marketplace Escrow Management</h2>

            {orders.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg shadow">
                    <p className="text-gray-500">No orders found.</p>
                </div>
            ) : (
                <div>
                    {orders.map((order: any) => (
                        <AdminOrderCard key={order.id} order={order} />
                    ))}
                </div>
            )}
        </div>
    );
}
