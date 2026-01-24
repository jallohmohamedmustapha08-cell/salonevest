'use client';

import { useState } from 'react';
import { deleteProduct } from '@/app/actions/marketplace';
import Image from 'next/image';

interface AdminProductListProps {
    products: any[];
    onActionComplete: () => void;
}

export default function AdminProductList({ products, onActionComplete }: AdminProductListProps) {
    const [loadingId, setLoadingId] = useState<string | null>(null);

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this product? This action cannot be undone.")) return;

        setLoadingId(id);
        const result = await deleteProduct(id);
        setLoadingId(null);

        if (result.error) {
            alert("Error: " + result.error);
        } else {
            alert("Product deleted successfully.");
            onActionComplete();
        }
    };

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold text-white">Marketplace Products</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                    <div key={product.id} className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden shadow-lg flex flex-col">
                        <div className="relative h-48 bg-gray-700">
                            {product.image_url ? (
                                <Image src={product.image_url} alt={product.title} fill className="object-cover" />
                            ) : (
                                <div className="flex items-center justify-center h-full text-gray-500">No Image</div>
                            )}
                            <div className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
                                Stock: {product.stock}
                            </div>
                        </div>
                        <div className="p-4 flex-1 flex flex-col">
                            <h3 className="text-lg font-bold text-white mb-1">{product.title}</h3>
                            <p className="text-sm text-gray-400 mb-2">by {product.profiles?.business_name || product.profiles?.full_name || 'Unknown'}</p>
                            <p className="text-green-400 font-bold mb-4">Le {product.price.toLocaleString()}</p>

                            <div className="mt-auto pt-4 border-t border-gray-700 flex justify-between items-center">
                                <span className="text-xs text-gray-500 uppercase">{product.category}</span>
                                <button
                                    onClick={() => handleDelete(product.id)}
                                    disabled={loadingId === product.id}
                                    className="text-red-400 hover:text-red-300 text-sm font-bold disabled:opacity-50"
                                >
                                    {loadingId === product.id ? 'Deleting...' : 'Delete'}
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {products.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                    No products found.
                </div>
            )}
        </div>
    );
}
