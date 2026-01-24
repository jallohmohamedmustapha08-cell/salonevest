import { getProducts } from '@/app/actions/marketplace';
import ProductCard from '@/components/marketplace/ProductCard';
import Link from 'next/link';

export default async function MarketplacePage() {
    const products = await getProducts();

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <p className="text-gray-600">Browse fresh produce and agricultural products directly from farmers.</p>
                <Link
                    href="/marketplace/cart"
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                >
                    View Cart
                </Link>
            </div>

            {products.length === 0 ? (
                <div className="text-center py-12">
                    <p className="text-gray-500 text-lg">No products available at the moment.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {products.map((product: any) => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            )}
        </div>
    );
}
