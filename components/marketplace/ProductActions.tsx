'use client';

import React, { useState, useEffect } from 'react';

export default function ProductActions({ product }: { product: any }) {
    const [quantity, setQuantity] = useState(1);
    const [cartQuantity, setCartQuantity] = useState(0);

    useEffect(() => {
        const updateCartQuantity = () => {
            const cart = JSON.parse(localStorage.getItem('marketplace_cart') || '[]');
            const existingItem = cart.find((item: any) => item.id === product.id);
            setCartQuantity(existingItem ? existingItem.quantity : 0);
        };

        updateCartQuantity();
        window.addEventListener('cart-updated', updateCartQuantity);
        return () => window.removeEventListener('cart-updated', updateCartQuantity);
    }, [product.id]);

    const availableStock = Math.max(0, product.stock - cartQuantity);

    const addToCart = () => {
        if (quantity > availableStock) {
            alert("Cannot add more than available stock!");
            return;
        }

        const cart = JSON.parse(localStorage.getItem('marketplace_cart') || '[]');
        const existingItem = cart.find((item: any) => item.id === product.id);

        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            cart.push({ ...product, quantity: quantity });
        }

        localStorage.setItem('marketplace_cart', JSON.stringify(cart));
        alert(`Added ${quantity} item(s) to cart!`);
        setQuantity(1); // Reset selector
        window.dispatchEvent(new Event('cart-updated'));
    };

    const increment = () => {
        if (quantity < availableStock) setQuantity(q => q + 1);
    };

    const decrement = () => {
        if (quantity > 1) setQuantity(q => q - 1);
    };

    return (
        <div className="flex flex-col space-y-4">
            <div className="flex items-center space-x-4">
                <label className="text-gray-700 font-medium">Quantity:</label>
                <div className="flex items-center border border-gray-300 rounded-md">
                    <button
                        onClick={decrement}
                        className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-l-md"
                        disabled={quantity <= 1}
                    >
                        -
                    </button>
                    <span className="px-4 py-1 text-gray-900 font-medium min-w-[3rem] text-center">{quantity}</span>
                    <button
                        onClick={increment}
                        className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-r-md"
                        disabled={quantity >= availableStock}
                    >
                        +
                    </button>
                </div>
                <span className="text-sm text-gray-500">
                    {availableStock} available {cartQuantity > 0 && <span className="text-xs text-blue-600">({cartQuantity} in cart)</span>}
                </span>
            </div>

            <button
                onClick={addToCart}
                disabled={availableStock <= 0}
                className={`px-8 py-3 rounded-md text-white font-bold text-lg transition-colors shadow-lg ${availableStock > 0
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-gray-400 cursor-not-allowed'
                    }`}
            >
                {availableStock > 0 ? 'Add to Cart' : 'Out of Stock'}
            </button>
        </div>
    );
}
