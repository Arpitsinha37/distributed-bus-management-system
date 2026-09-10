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
        const queryParams = Object.fromEntries(searchParams.entries());
        
        // Send the query params to the backend webhook endpoint
        await api.post(`/payments/${params.gateway}/webhook`, queryParams);

        let bookingId = '';
        if (params.gateway === 'khalti') {
          bookingId = queryParams.purchase_order_id;
        } else if (params.gateway === 'esewa') {
          const decoded = JSON.parse(atob(queryParams.data));
          bookingId = decoded.transaction_uuid.split('-')[1];
        } else if (params.gateway === 'paco') {
          bookingId = queryParams.order_id || queryParams.bookingId || '';
        }

        if (bookingId) {
          // Fetch the booking to get the PNR
          const res = await api.get(`/bookings/by-id/${bookingId}`);
          const pnr = res.data.pnr || res.data.bookingRef;
          router.push(`/ticket/${pnr}`);
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
      <div className="bg-white p-8 rounded-2xl shadow-sm text-center max-w-sm mx-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#DC143C] mx-auto mb-4"></div>
        <h2 className="text-xl font-bold text-gray-900">{status}</h2>
        <p className="text-gray-500 mt-2 text-sm">Please do not close or refresh this page.</p>
      </div>
    </div>
  );
}
