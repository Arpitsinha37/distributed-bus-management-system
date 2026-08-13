'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { api } from '@/lib/api';

export default function CheckoutPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const seats = searchParams.get('seats')?.split(',') || [];
  
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    passengerName: '',
    contactEmail: '',
    contactPhone: '',
    boardingPointId: '',
    droppingPointId: ''
  });

  const [schedule, setSchedule] = useState<any>(null);

  useEffect(() => {
    // In a real app we'd fetch this SSR, but for rapid client-side hydration we fetch here
    // or pass it via state context.
    api.get(`/schedules/${params.id}`).then(res => setSchedule(res.data.data));
  }, [params.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const res = await api.post('/bookings/hold', {
        scheduleId: params.id,
        seats,
        ...formData,
      });

      const pnr = res.data.pnr;
      router.push(`/payment/${pnr}`);
    } catch (error) {
      console.error(error);
      alert("Booking failed. Please try again.");
      setLoading(false);
    }
  };

  if (!schedule) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  const totalFare = seats.length * schedule.baseFare;

  return (
    <main className="min-h-screen bg-neutral-50 py-10">
      <div className="max-w-3xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">Passenger Details</h1>
        
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-neutral-200">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-neutral-600">Full Name</label>
                <input 
                  type="text" 
                  required 
                  className="w-full px-4 py-3 rounded-lg border border-neutral-300 focus:ring-2 focus:ring-orange-500"
                  onChange={e => setFormData({...formData, passengerName: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-neutral-600">Phone Number</label>
                <input 
                  type="tel" 
                  required 
                  className="w-full px-4 py-3 rounded-lg border border-neutral-300 focus:ring-2 focus:ring-orange-500"
                  onChange={e => setFormData({...formData, contactPhone: e.target.value})}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-semibold text-neutral-600">Email Address</label>
              <input 
                type="email" 
                required 
                className="w-full px-4 py-3 rounded-lg border border-neutral-300 focus:ring-2 focus:ring-orange-500"
                onChange={e => setFormData({...formData, contactEmail: e.target.value})}
              />
            </div>

            <div className="border-t pt-6 flex justify-between items-center">
              <div>
                <p className="text-neutral-500 text-sm">Selected Seats: <span className="font-bold text-neutral-900">{seats.join(', ')}</span></p>
                <p className="text-2xl font-bold text-neutral-900 mt-1">Total: NPR {totalFare}</p>
              </div>
              <button 
                type="submit" 
                disabled={loading}
                className="bg-orange-600 hover:bg-orange-700 text-white font-semibold py-3 px-8 rounded-xl transition-colors disabled:opacity-70"
              >
                {loading ? 'Processing...' : 'Proceed to Payment'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
