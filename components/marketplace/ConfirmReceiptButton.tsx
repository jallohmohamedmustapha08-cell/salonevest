'use client';

import { confirmOrderReceipt } from '@/app/actions/marketplace';
import { useState } from 'react';

export default function ConfirmReceiptButton({ orderId }: { orderId: string }) {
    const [loading, setLoading] = useState(false);

    const handleConfirm = async () => {
        if (!confirm('Are you sure you have received this order? This will release funds to the seller.')) return;

        setLoading(true);
        const result = await confirmOrderReceipt(orderId);
        setLoading(false);

        if (result.error) {
            alert('Error: ' + result.error);
        } else {
            alert('Receipt confirmed! Thank you.');
        }
    };

    return (
        <button
            onClick={handleConfirm}
            disabled={loading}
            className="px-4 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors disabled:opacity-50"
        >
            {loading ? 'Processing...' : 'Confirm Receipt'}
        </button>
    );
}
