'use client';

import { useRouter } from 'next/navigation';
import { useBookingStore } from '@/lib/store';
import { TripDetail, Passenger } from '@/lib/types';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { MapPin, Users, Phone } from 'lucide-react';

/* Star-burst SVG icon */
const StarBurst = () => (
  <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
    <path
      d="M8 0C8 0 7.32 2.42 7.32 4C7.32 5.58 8 8 8 8C8 8 5.58 7.32 4 7.32C2.42 7.32 0 8 0 8C0 8 .68 5.58 .68 4C.68 2.42 0 0 0 0C0 0 2.42 .68 4 .68C5.58 .68 8 0 8 0Z"
      fill="#0D2E37"
    />
  </svg>
);

export default function DetailsClient({ trip }: { trip: TripDetail }) {
  const router = useRouter();
  const { 
    selectedSeats, 
    passengers, 
    setPassenger, 
    customerInfo, 
    setCustomerInfo,
    boardingPoint,
    droppingPoint,
    setPoints,
    setBookingDetails
  } = useBookingStore();
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Redirect if no seats selected
  useEffect(() => {
    if (selectedSeats.length === 0) {
      router.push(`/`);
    }
  }, [selectedSeats, router]);

  if (selectedSeats.length === 0) return null;

  const handlePassengerChange = (index: number, field: keyof Passenger, value: string) => {
    const passenger = passengers[index] || { seatNumber: selectedSeats[index], name: '' };
    setPassenger(index, { ...passenger, [field]: value });
  };

  const handleHoldSeats = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const res = await api.post('/bookings/hold', {
        tripId: trip.tripId,
        seats: selectedSeats,
        boardingPoint: boardingPoint || trip.route.boardingPoints[0],
        droppingPoint: droppingPoint || trip.route.droppingPoints[0],
        customerInfo,
        passengers
      });
      
      setBookingDetails(res.data.id, res.data.bookingRef, res.data.heldUntil);
      router.push(`/book/${trip.tripId}/pay`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to hold seats. They might have been booked by someone else.');
    } finally {
      setIsLoading(false);
    }
  };

  const totalFare = selectedSeats.length * Number(trip.fare);

  return (
    <form onSubmit={handleHoldSeats} className="flex flex-col lg:flex-row gap-8">
      {/* Forms Section */}
      <div className="flex-1 space-y-8">
        
        {/* Points Selection */}
        <div className="glass rounded-3xl p-8 md:p-10">
          <h2 className="text-xl font-display font-bold text-white mb-8 flex items-center gap-3">
            <MapPin className="w-5 h-5 text-brand-green" />
            Boarding & Dropping
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-[0.6875rem] font-semibold text-white/30 uppercase tracking-[0.15em] mb-3">
                Boarding Point
              </label>
              <select 
                required
                className="input-dark-simple"
                value={boardingPoint || ''}
                onChange={(e) => setPoints(e.target.value, droppingPoint || '')}
              >
                <option value="" disabled>Select boarding point</option>
                {trip.route.boardingPoints.map((pt, i) => (
                  <option key={i} value={pt}>{pt}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[0.6875rem] font-semibold text-white/30 uppercase tracking-[0.15em] mb-3">
                Dropping Point
              </label>
              <select 
                required
                className="input-dark-simple"
                value={droppingPoint || ''}
                onChange={(e) => setPoints(boardingPoint || '', e.target.value)}
              >
                <option value="" disabled>Select dropping point</option>
                {trip.route.droppingPoints.map((pt, i) => (
                  <option key={i} value={pt}>{pt}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Passenger Details */}
        <div className="glass rounded-3xl p-8 md:p-10">
          <h2 className="text-xl font-display font-bold text-white mb-8 flex items-center gap-3">
            <Users className="w-5 h-5 text-brand-green" />
            Traveler Details
          </h2>
          <div className="space-y-8">
            {selectedSeats.map((seat, index) => (
              <div key={seat} className="border-b border-white/[0.06] last:border-0 pb-8 last:pb-0">
                <div className="flex items-center gap-3 mb-6">
                  <span className="bg-brand-green/10 border border-brand-green/20 text-brand-green text-xs uppercase tracking-widest font-bold px-3 py-1 rounded-full">
                    Seat {seat}
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-[0.6875rem] font-semibold text-white/30 uppercase tracking-[0.15em] mb-3">
                      Full Name
                    </label>
                    <input 
                      type="text" 
                      required
                      placeholder="e.g. John Doe"
                      value={passengers[index]?.name || ''}
                      onChange={(e) => handlePassengerChange(index, 'name', e.target.value)}
                      className="input-dark-simple"
                    />
                  </div>
                  <div>
                    <label className="block text-[0.6875rem] font-semibold text-white/30 uppercase tracking-[0.15em] mb-3">
                      Age
                    </label>
                    <input 
                      type="number" 
                      required
                      min="1" max="120"
                      placeholder="e.g. 25"
                      value={passengers[index]?.age || ''}
                      onChange={(e) => handlePassengerChange(index, 'age', e.target.value)}
                      className="input-dark-simple"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Contact Details */}
        <div className="glass rounded-3xl p-8 md:p-10">
          <h2 className="text-xl font-display font-bold text-white mb-2 flex items-center gap-3">
            <Phone className="w-5 h-5 text-brand-green" />
            Contact Information
          </h2>
          <p className="text-sm text-white/40 mb-8 ml-8">Your ticket will be sent to these details.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-[0.6875rem] font-semibold text-white/30 uppercase tracking-[0.15em] mb-3">
                Contact Name
              </label>
              <input 
                type="text" 
                required
                value={customerInfo.name}
                onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })}
                className="input-dark-simple"
              />
            </div>
            <div>
              <label className="block text-[0.6875rem] font-semibold text-white/30 uppercase tracking-[0.15em] mb-3">
                Phone Number
              </label>
              <input 
                type="tel" 
                required
                value={customerInfo.phone}
                onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
                className="input-dark-simple"
              />
            </div>
            <div>
              <label className="block text-[0.6875rem] font-semibold text-white/30 uppercase tracking-[0.15em] mb-3">
                Email Address
              </label>
              <input 
                type="email" 
                required
                value={customerInfo.email}
                onChange={(e) => setCustomerInfo({ ...customerInfo, email: e.target.value })}
                className="input-dark-simple"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Summary Sidebar */}
      <div className="lg:w-96">
        <div className="glass-static rounded-3xl p-8 md:p-10 sticky top-28">
          <h3 className="text-xl font-display font-bold text-white mb-6 pb-6 border-b border-white/[0.06]">
            Journey Summary
          </h3>
          
          <div className="space-y-5 mb-8">
            <div className="flex justify-between items-center text-sm">
              <span className="text-white/40 font-medium">Route</span>
              <span className="font-semibold text-white text-right max-w-[150px]">{trip.route.origin} to {trip.route.destination}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-white/40 font-medium">Departure</span>
              <span className="font-semibold text-white">{trip.departureTime}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-white/40 font-medium">Class</span>
              <span className="font-semibold text-brand-green">{trip.bus.type}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-white/40 font-medium">Seats</span>
              <span className="font-semibold text-white">{selectedSeats.join(', ')}</span>
            </div>
          </div>
          
          <div className="bg-white/[0.04] p-5 rounded-2xl mb-8">
            <div className="flex justify-between items-end">
              <span className="text-white/40 font-medium text-sm">Total Fare</span>
              <span className="text-2xl font-display font-bold text-brand-green">NPR {totalFare.toLocaleString()}</span>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="btn-accent w-full justify-center py-4 text-sm disabled:opacity-50"
          >
            {isLoading ? 'Securing Seats...' : (
              <>Proceed to Payment <StarBurst /></>
            )}
          </button>
        </div>
      </div>
    </form>
  );
}
