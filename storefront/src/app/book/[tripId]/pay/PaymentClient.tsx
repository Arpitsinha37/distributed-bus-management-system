'use client';

import { useRouter } from 'next/navigation';
import { useBookingStore } from '@/lib/store';
import { TripDetail } from '@/lib/types';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import dayjs from 'dayjs';

export default function PaymentClient({ trip }: { trip: TripDetail }) {
  const router = useRouter();
  const { bookingId, bookingRef, heldUntil, selectedSeats, reset } = useBookingStore();
  
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const baseFare = selectedSeats.length * Number(trip.fare);
  const totalFare = baseFare - discount;

  // Redirect if no booking ref
  useEffect(() => {
    if (!bookingId || !bookingRef) {
      router.push(`/book/${trip.tripId}`);
    }
  }, [bookingId, bookingRef, router, trip.tripId]);

  if (!bookingId || !bookingRef) return null;

  const timeRemaining = heldUntil ? dayjs(heldUntil).diff(dayjs(), 'minute') : 0;

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate coupon for MVP or hit backend if `/coupons/validate` exists.
    // For now, if code is 'DISCOUNT10', give 10% off.
    if (couponCode === 'DISCOUNT10') {
      setDiscount(baseFare * 0.10);
      setError('');
    } else {
      setError('Invalid or expired coupon code.');
      setDiscount(0);
    }
  };

  const handlePayment = async (gateway: string) => {
    setIsLoading(true);
    setError('');
    try {
      // Call the real payment initiation endpoint
      const res = await api.post(`/payments/${gateway}/initiate`, {
        bookingId
      });

      if (gateway === 'esewa') {
         // eSewa returns clientSecret (base64 encoded form data) and redirectUrl
         const formData = JSON.parse(atob(res.data.clientSecret));
         
         // Create a form dynamically and submit it
         const form = document.createElement('form');
         form.setAttribute('method', 'POST');
         form.setAttribute('action', res.data.redirectUrl);
         for (const key in formData) {
             const hiddenField = document.createElement('input');
             hiddenField.setAttribute('type', 'hidden');
             hiddenField.setAttribute('name', key);
             hiddenField.setAttribute('value', formData[key]);
             form.appendChild(hiddenField);
         }
         document.body.appendChild(form);
         form.submit();
      } else if (gateway === 'khalti') {
         // Khalti returns a redirectUrl
         window.location.href = res.data.redirectUrl;
      } else {
         // Fallback/Mock for card or unsupported for now
         const mock = await api.post(`/bookings/${bookingId}/mock-pay`, {
           gateway,
           gatewayTxnId: `TXN-${Math.floor(Math.random() * 1000000)}`
         });
         if (mock.data.status === 'CONFIRMED') {
           reset();
           router.push(`/ticket/${mock.data.bookingRef}`);
         }
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Payment initiation failed. Please try again.');
      setIsLoading(false); // only reset loading if failed, otherwise we are redirecting
    }
  };

  return (
    <div className="flex flex-col md:flex-row gap-8">
      {/* Payment Options */}
      <div className="flex-1 space-y-8">
        {timeRemaining > 0 && (
          <div className="bg-orange-50 border border-orange-200 text-orange-800 p-4 rounded-xl flex justify-between items-center">
            <span className="font-medium">Complete payment to secure your seats.</span>
            <span className="font-bold text-orange-900 bg-orange-100 px-3 py-1 rounded-full">
              {timeRemaining} mins left
            </span>
          </div>
        )}

        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Select Payment Method</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button 
              onClick={() => handlePayment('esewa')}
              disabled={isLoading}
              className="border-2 border-gray-200 hover:border-green-500 rounded-xl p-6 flex flex-col items-center justify-center gap-3 transition-colors disabled:opacity-50 group"
            >
              <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center font-bold text-lg group-hover:bg-green-500 group-hover:text-white transition-colors">
                e
              </div>
              <span className="font-bold text-gray-700 group-hover:text-green-600">eSewa</span>
            </button>

            <button 
              onClick={() => handlePayment('khalti')}
              disabled={isLoading}
              className="border-2 border-gray-200 hover:border-purple-500 rounded-xl p-6 flex flex-col items-center justify-center gap-3 transition-colors disabled:opacity-50 group"
            >
              <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center font-bold text-lg group-hover:bg-purple-500 group-hover:text-white transition-colors">
                K
              </div>
              <span className="font-bold text-gray-700 group-hover:text-purple-600">Khalti</span>
            </button>
            
            <button 
              onClick={() => handlePayment('card')}
              disabled={isLoading}
              className="border-2 border-gray-200 hover:border-blue-500 rounded-xl p-6 flex flex-col items-center justify-center gap-3 transition-colors disabled:opacity-50 group md:col-span-2"
            >
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-lg group-hover:bg-blue-500 group-hover:text-white transition-colors">
                💳
              </div>
              <span className="font-bold text-gray-700 group-hover:text-blue-600">Credit / Debit Card</span>
            </button>
          </div>
          
          {error && (
            <div className="mt-6 p-4 bg-red-50 text-red-700 text-sm rounded-xl border border-red-100">
              {error}
            </div>
          )}
        </div>
      </div>

      {/* Order Summary */}
      <div className="md:w-96">
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 sticky top-24">
          <h3 className="text-xl font-bold text-gray-900 mb-6 pb-6 border-b border-gray-100">Order Summary</h3>
          
          <div className="space-y-4 mb-8">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-500">Booking Ref</span>
              <span className="font-bold text-gray-900">{bookingRef}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-500">Route</span>
              <span className="font-bold text-gray-900">{trip.route.origin} - {trip.route.destination}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-500">Seats</span>
              <span className="font-bold text-gray-900">{selectedSeats.join(', ')}</span>
            </div>
          </div>

          <form onSubmit={handleApplyCoupon} className="mb-6 flex gap-2">
            <input 
              type="text" 
              placeholder="Coupon Code" 
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value)}
              className="flex-1 px-4 py-2 rounded-lg bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-500 text-sm uppercase"
            />
            <button type="submit" className="bg-gray-900 hover:bg-gray-800 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors">
              Apply
            </button>
          </form>

          <div className="border-t border-gray-100 pt-6 mb-8 space-y-3">
            <div className="flex justify-between items-end text-sm">
              <span className="text-gray-500">Subtotal</span>
              <span className="font-bold text-gray-900">NPR {baseFare.toLocaleString()}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between items-end text-sm text-green-600">
                <span>Discount</span>
                <span className="font-bold">- NPR {discount.toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between items-end pt-3 border-t border-gray-100 mt-3">
              <span className="text-gray-900 font-bold">Total Amount</span>
              <span className="text-3xl font-bold text-red-600">NPR {totalFare.toLocaleString()}</span>
            </div>
          </div>

          <p className="text-xs text-gray-400 text-center">
            By clicking any payment method, you agree to our Terms and Conditions and Cancellation Policy.
          </p>
        </div>
      </div>
    </div>
  );
}
