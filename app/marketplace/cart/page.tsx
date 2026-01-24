'use client';

import React, { useEffect, useState } from 'react';
import { createOrder } from '@/app/actions/marketplace';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import PaymentModal from '@/components/common/PaymentModal';

export default function CartPage() {
    const [cart, setCart] = useState<any[]>([]);
    const [shippingAddress, setShippingAddress] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const storedCart = JSON.parse(localStorage.getItem('marketplace_cart') || '[]');
        setCart(storedCart);
    }, []);

    const updateQuantity = (id: string, delta: number) => {
        const newCart = cart.map(item => {
            if (item.id === id) {
                return { ...item, quantity: Math.max(1, item.quantity + delta) };
            }
            return item;
        });
        setCart(newCart);
        localStorage.setItem('marketplace_cart', JSON.stringify(newCart));
    };

    const removeItem = (id: string) => {
        const newCart = cart.filter(item => item.id !== id);
        setCart(newCart);
        localStorage.setItem('marketplace_cart', JSON.stringify(newCart));
    };

    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    const handleCheckoutClick = () => {
        if (!shippingAddress.trim()) {
            alert('Please enter a shipping address.');
            return;
        }
        setShowPaymentModal(true);
    };

    const handlePaymentConfirm = async (paymentMethod: 'mobile_money' | 'crypto', txHash: string | null) => {
        setIsSubmitting(true);
        try {
            // Pass payment details to createOrder
            const result = await createOrder(cart, total, shippingAddress, paymentMethod, txHash);

            if (result.error) {
                alert('Error placing order: ' + result.error);
            } else {
                alert('Payment successful! Order placed.');
                localStorage.removeItem('marketplace_cart');
                setCart([]);
                router.push('/marketplace/orders');
            }
        } catch (error) {
            console.error('Checkout error:', error);
            alert('An unexpected error occurred.');
        } finally {
            setIsSubmitting(false);
            setShowPaymentModal(false);
        }
    };

    if (cart.length === 0) {
        return (
            <div className="text-center py-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Your Cart is Empty</h2>
                <Link href="/marketplace" className="text-blue-600 hover:underline">
                    Start Shopping
                </Link>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Shopping Cart</h2>

            <div className="space-y-6">
                {cart.map((item) => (
                    <div key={item.id} className="flex items-center border-b pb-4">
                        <div className="relative h-20 w-20 bg-gray-200 rounded-md overflow-hidden flex-shrink-0">
                            {item.image_url ? (
                                <Image src={item.image_url} alt={item.title} fill className="object-cover" />
                            ) : (
                                <div className="flex items-center justify-center h-full text-xs text-gray-400">No Image</div>
                            )}
                        </div>
                        <div className="ml-4 flex-1">
                            <h3 className="text-lg font-medium text-gray-900">{item.title}</h3>
                            <p className="text-gray-500">Le {item.price.toLocaleString()}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                            <button
                                onClick={() => updateQuantity(item.id, -1)}
                                className="p-1 rounded-md bg-gray-100 hover:bg-gray-200"
                            >
                                -
                            </button>
                            <span className="w-8 text-center">{item.quantity}</span>
                            <button
                                onClick={() => updateQuantity(item.id, 1)}
                                className="p-1 rounded-md bg-gray-100 hover:bg-gray-200"
                            >
                                +
                            </button>
                        </div>
                        <div className="ml-6 text-right">
                            <p className="font-bold text-gray-900">Le {(item.price * item.quantity).toLocaleString()}</p>
                            <button
                                onClick={() => removeItem(item.id)}
                                className="text-red-500 text-sm hover:underline mt-1"
                            >
                                Remove
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-8 border-t pt-6">
                <div className="flex justify-between items-center text-xl font-bold text-gray-900 mb-6">
                    <span>Total</span>
                    <span>Le {total.toLocaleString()}</span>
                </div>

                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Shipping Address</label>
                    <textarea
                        value={shippingAddress}
                        onChange={(e) => setShippingAddress(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                        rows={3}
                        placeholder="Enter your full delivery address..."
                    />
                </div>

                <div className="flex justify-end space-x-4">
                    <Link
                        href="/marketplace"
                        className="px-6 py-3 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                        Continue Shopping
                    </Link>
                    <button
                        onClick={handleCheckoutClick}
                        disabled={isSubmitting}
                        className={`px-6 py-3 rounded-md text-white font-medium transition-colors ${isSubmitting ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
                            }`}
                    >
                        Proceed to Payment
                    </button>
                </div>
            </div>

            {showPaymentModal && (
                <PaymentModal
                    amount={total}
                    onClose={() => setShowPaymentModal(false)}
                    onConfirm={handlePaymentConfirm}
                    isProcessing={isSubmitting}
                    title="Checkout Payment"
                />
            )}
        </div>
    );
}
