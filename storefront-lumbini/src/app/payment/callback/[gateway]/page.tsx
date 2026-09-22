'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { api } from '@/lib/api';

export default function PaymentCallbackPage({ params }: { params: { gateway: string } }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState('Processing your payment...');

  useEffect(() => {
    const processCallback = async () => {
      try {
        // eSewa sends 'data' query param. Khalti sends 'pidx', 'purchase_order_id', etc.
        const queryParams = Object.fromEntries(searchParams.entries());
        
        // We send the query params to the backend webhook endpoint
        const response = await api.post(`/payments/${params.gateway}/webhook`, queryParams, {
          // eSewa requires signature, but the signature is inside the 'data' param for eSewa
          // or in the query params. We just send the payload.
          headers: {
            'Content-Type': 'application/json',
          }
        });

        if (response.data && response.data.status === 'FAILED') {
          throw new Error('Payment was declined or failed verification.');
        }

        // After the webhook is processed, the booking should be CONFIRMED.
        // We can extract the booking ID from the params or rely on the backend response.
        // For simplicity, we just redirect to a success page or ticket page.
        // E.g., for Khalti, purchase_order_id is the bookingId.
        // For eSewa, it's inside the base64 encoded 'data'.
        
        let bookingId = '';
        if (params.gateway === 'khalti') {
          bookingId = queryParams.purchase_order_id;
        } else if (params.gateway === 'esewa') {
          const decoded = JSON.parse(atob(queryParams.data));
          bookingId = decoded.transaction_uuid.split('-')[1];
        }

        if (bookingId) {
          // Fetch the booking to get the PNR
          const res = await api.get(`/bookings/by-id/${bookingId}`);
          router.push(`/ticket/${res.data.pnr}`);
        } else {
          router.push('/');
        }
      } catch (error: any) {
        console.error('Payment verification failed:', error);
        const reason = error?.message || 'Payment verification failed. Please contact support.';
        router.push(`/payment-fail?reason=${encodeURIComponent(reason)}&gateway=${params.gateway}`);
      }
    };

    processCallback();
  }, [params.gateway, searchParams, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-2xl shadow-sm text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-green mx-auto mb-4"></div>
        <h2 className="text-xl font-bold">{status}</h2>
        <p className="text-gray-500 mt-2">Please do not close or refresh this page.</p>
      </div>
    </div>
  );
}
