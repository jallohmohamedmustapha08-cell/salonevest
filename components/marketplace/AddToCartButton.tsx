'use client';

import React from 'react';
import { safeStorage } from '@/utils/safeStorage';

export default function AddToCartButton({ product }: { product: any }) {
    const addToCart = () => {
        const cart = JSON.parse(safeStorage.getItem('marketplace_cart') || '[]');
        const existingItem = cart.find((item: any) => item.id === product.id);

        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({ ...product, quantity: 1 });
        }

        safeStorage.setItem('marketplace_cart', JSON.stringify(cart));
        alert('Added to cart!');
        window.dispatchEvent(new Event('cart-updated'));
    };

    return (
        <button
            onClick={addToCart}
            disabled={product.stock <= 0}
            className={`px-6 py-3 rounded-md text-white font-medium transition-colors ${product.stock > 0
                ? 'bg-green-600 hover:bg-green-700'
                : 'bg-gray-400 cursor-not-allowed'
                }`}
        >
            {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
        </button>
    );
}
