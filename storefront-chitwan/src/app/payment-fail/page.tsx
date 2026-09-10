'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { XCircle, RefreshCw, Home, Phone } from 'lucide-react';

export default function PaymentFailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const reason = searchParams.get('reason') || 'Payment could not be processed';
  const bookingRef = searchParams.get('ref');
  const gateway = searchParams.get('gateway');

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-amber-50 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md mx-auto">
        <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-red-100 overflow-hidden">
          
          {/* Header */}
          <div className="bg-gradient-to-r from-red-500 to-rose-500 px-8 py-10 text-center relative overflow-hidden">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 left-0 w-32 h-32 bg-white/30 rounded-full -translate-x-16 -translate-y-16" />
              <div className="absolute bottom-0 right-0 w-40 h-40 bg-white/20 rounded-full translate-x-12 translate-y-12" />
            </div>
            <div className="relative z-10">
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm border border-white/30 animate-pulse">
                <XCircle className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-white">Payment Failed</h1>
              <p className="text-red-100 mt-2 text-sm">Your payment could not be completed</p>
            </div>
          </div>

          {/* Body */}
          <div className="p-8">
            {/* Reason */}
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
              <p className="text-sm text-red-700 text-center">{reason}</p>
            </div>

            {/* Details */}
            <div className="space-y-3 mb-8">
              {bookingRef && (
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500">Booking Ref</span>
                  <span className="font-mono font-bold text-gray-900">{bookingRef}</span>
                </div>
              )}
              {gateway && (
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500">Payment Method</span>
                  <span className="font-bold text-gray-900 capitalize">{gateway}</span>
                </div>
              )}
            </div>

            {/* Reassurance */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
              <p className="text-sm text-amber-800 text-center">
                <strong>Don&apos;t worry!</strong> No money has been deducted from your account. 
                If any amount was deducted, it will be refunded within 24-48 hours.
              </p>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <button
                onClick={() => router.back()}
                className="w-full flex items-center justify-center gap-2 bg-[#DC143C] hover:bg-red-700 text-white font-bold py-3.5 rounded-xl transition-all active:scale-95 text-sm shadow-md shadow-red-500/20"
              >
                <RefreshCw className="w-4 h-4" />
                Try Again
              </button>
              <div className="flex gap-3">
                <button
                  onClick={() => router.push('/')}
                  className="flex-1 flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3 rounded-xl transition-all active:scale-95 text-sm"
                >
                  <Home className="w-4 h-4" />
                  Home
                </button>
                <a
                  href="tel:+977"
                  className="flex-1 flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3 rounded-xl transition-all active:scale-95 text-sm"
                >
                  <Phone className="w-4 h-4" />
                  Contact Us
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
