'use client';

import Link from 'next/link';
import Image from 'next/image';

interface Product {
    id: string;
    title: string;
    price: number;
    image_url: string | null;
    category: string;
    entrepreneur_id: string;
}

export default function ProductCard({ product }: { product: Product }) {
    const addToCart = (e: React.MouseEvent) => {
        e.preventDefault();
        // Simple localStorage cart implementation
        const cart = JSON.parse(localStorage.getItem('marketplace_cart') || '[]');
        const existingItem = cart.find((item: any) => item.id === product.id);

        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({ ...product, quantity: 1 });
        }

        localStorage.setItem('marketplace_cart', JSON.stringify(cart));
        alert('Added to cart!');
        // Trigger a custom event or use context to update cart count in navbar if we had one
        window.dispatchEvent(new Event('cart-updated'));
    };

    return (
        <Link href={`/marketplace/${product.id}`} className="group">
            <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300">
                <div className="relative h-48 w-full bg-gray-200">
                    {product.image_url ? (
                        <Image
                            src={product.image_url}
                            alt={product.title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                    ) : (
                        <div className="flex items-center justify-center h-full text-gray-400">
                            No Image
                        </div>
                    )}
                </div>
                <div className="p-4">
                    <div className="text-sm text-green-600 font-medium mb-1">{product.category}</div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 truncate">{product.title}</h3>
                    <div className="flex items-center justify-between">
                        <span className="text-xl font-bold text-gray-900">Le {product.price.toLocaleString()}</span>
                        <button
                            onClick={addToCart}
                            className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors"
                        >
                            Add
                        </button>
                    </div>
                </div>
            </div>
        </Link>
    );
}
