'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { CheckCircle2, ShieldCheck, CreditCard } from 'lucide-react';

export default function PaymentPage({ params }: { params: { pnr: string } }) {
  const router = useRouter();
  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get(`/bookings/${params.pnr}`).then(res => setBooking(res.data.data));
  }, [params.pnr]);

  const handleMockPay = async () => {
    setLoading(true);
    try {
      // MVP ONLY: Calls the mock payment endpoint to flip status to CONFIRMED
      await api.post(`/bookings/${booking.id}/mock-pay`);
      router.push(`/ticket/${params.pnr}`);
    } catch (error) {
      console.error(error);
      alert("Payment failed");
      setLoading(false);
    }
  };

  if (!booking) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <main className="min-h-screen bg-neutral-50 py-20">
      <div className="max-w-xl mx-auto px-4">
        
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-neutral-100">
          <div className="bg-neutral-900 text-white p-8 text-center">
            <h2 className="text-2xl font-bold mb-2">Complete Payment</h2>
            <p className="text-neutral-400">PNR: <span className="text-white font-mono">{booking.pnr}</span></p>
          </div>

          <div className="p-8">
            <div className="flex justify-between items-center mb-6 pb-6 border-b border-neutral-100">
              <span className="text-neutral-500">Total Amount</span>
              <span className="text-3xl font-bold text-neutral-900">NPR {booking.totalFare}</span>
            </div>

            <div className="space-y-4 mb-8">
              <div className="flex items-center gap-3 text-sm text-neutral-600">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                <span>{booking.passengerName} ({booking.contactPhone})</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-neutral-600">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                <span>{booking.schedule.route.origin} to {booking.schedule.route.destination}</span>
              </div>
            </div>

            <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 mb-8">
              <div className="flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-orange-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-orange-900">Secure Payment Simulation</h4>
                  <p className="text-sm text-orange-700 mt-1">
                    This is a mock payment for the MVP. Clicking pay will instantly confirm your booking in the backend.
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={handleMockPay}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-neutral-900 hover:bg-neutral-800 text-white font-bold py-4 rounded-xl transition-all active:scale-95 disabled:opacity-70"
            >
              <CreditCard className="w-5 h-5" />
              {loading ? 'Processing...' : `Pay NPR ${booking.totalFare}`}
            </button>
          </div>
        </div>

      </div>
    </main>
  );
}
