'use client';

import { useState } from 'react';
import Image from 'next/image';
import EditProductModal from './EditProductModal';
import { useRouter } from 'next/navigation';

export default function EntrepreneurProductList({ initialProducts }: { initialProducts: any[] }) {
    const [editingProduct, setEditingProduct] = useState<any | null>(null);
    const router = useRouter();

    const handleSuccess = () => {
        router.refresh();
    };

    return (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
                {initialProducts.map((product) => (
                    <li key={product.id}>
                        <div className="px-4 py-4 flex items-center sm:px-6">
                            <div className="min-w-0 flex-1 sm:flex sm:items-center sm:justify-between">
                                <div className="flex items-center">
                                    <div className="h-12 w-12 bg-gray-200 rounded overflow-hidden relative flex-shrink-0">
                                        {product.image_url && (
                                            <Image src={product.image_url} alt={product.title} fill className="object-cover" />
                                        )}
                                    </div>
                                    <div className="ml-4 truncate">
                                        <div className="flex text-sm">
                                            <p className="font-medium text-indigo-600 truncate">{product.title}</p>
                                            <p className="ml-1 flex-shrink-0 font-normal text-gray-500">in {product.category}</p>
                                        </div>
                                        <div className="mt-2 flex">
                                            <div className="flex items-center text-sm text-gray-500">
                                                <p>Stock: {product.stock} | Price: Le {product.price}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-4 flex-shrink-0 sm:mt-0 sm:ml-5">
                                    <button
                                        onClick={() => setEditingProduct(product)}
                                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-full shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                    >
                                        Edit
                                    </button>
                                </div>
                            </div>
                        </div>
                    </li>
                ))}
                {initialProducts.length === 0 && (
                    <li className="px-4 py-4 text-center text-gray-500">No products listed yet.</li>
                )}
            </ul>

            {editingProduct && (
                <EditProductModal
                    product={editingProduct}
                    onClose={() => setEditingProduct(null)}
                    onSuccess={handleSuccess}
                />
            )}
        </div>
    );
}
