'use client';
import dynamic from 'next/dynamic';

const PaymentSuccess = dynamic(() => import('@/pages-nrt/PaymentSuccess'), { ssr: false });

export default function PaymentSuccessPage() {
  return <PaymentSuccess />;
}
