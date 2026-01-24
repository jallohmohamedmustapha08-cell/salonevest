import { getProduct } from '@/app/actions/marketplace';
import ProductActions from '@/components/marketplace/ProductActions';
import Link from 'next/link';
import Image from 'next/image';

export default async function ProductDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const product = await getProduct(id);

    if (!product) {
        return (
            <div className="text-center py-12">
                <h2 className="text-2xl font-bold text-gray-900">Product Not Found</h2>
                <Link href="/marketplace" className="text-blue-600 hover:underline mt-4 inline-block">
                    Back to Marketplace
                </Link>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="md:flex">
                <div className="md:w-1/2 relative h-96 bg-gray-200">
                    {product.image_url ? (
                        <Image
                            src={product.image_url}
                            alt={product.title}
                            fill
                            className="object-cover"
                        />
                    ) : (
                        <div className="flex items-center justify-center h-full text-gray-400">
                            No Image
                        </div>
                    )}
                </div>
                <div className="p-8 md:w-1/2">
                    <div className="uppercase tracking-wide text-sm text-green-600 font-semibold mb-2">
                        {product.category}
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-4">{product.title}</h1>
                    <p className="text-gray-600 mb-6">{product.description}</p>

                    <div className="flex items-center mb-6">
                        <span className="text-3xl font-bold text-gray-900">Le {product.price.toLocaleString()}</span>
                        <span className="ml-4 text-sm text-gray-500">
                            Stock: {product.stock > 0 ? product.stock : 'Out of Stock'}
                        </span>
                    </div>

                    <div className="mb-6">
                        <h3 className="text-sm font-medium text-gray-900">Seller:</h3>
                        <p className="text-gray-600">
                            {product.profiles?.business_name || product.profiles?.full_name || 'Unknown Seller'}
                        </p>
                    </div>

                    <div className="flex space-x-4 items-end">
                        <ProductActions product={product} />
                        <Link
                            href="/marketplace"
                            className="px-6 py-3 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                            Continue Shopping
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
