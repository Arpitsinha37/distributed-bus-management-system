'use client';

import { useRouter } from 'next/navigation';
import { useBookingStore } from '@/lib/store';
import { TripDetail, Passenger } from '@/lib/types';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

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
      router.push(`/book/${trip.tripId}`);
    }
  }, [selectedSeats, router, trip.tripId]);

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
    <form onSubmit={handleHoldSeats} className="flex flex-col md:flex-row gap-8">
      {/* Forms Section */}
      <div className="flex-1 space-y-8">
        
        {/* Points Selection */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Boarding & Dropping</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Boarding Point</label>
              <select 
                required
                className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-500"
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
              <label className="block text-sm font-bold text-gray-700 mb-2">Dropping Point</label>
              <select 
                required
                className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-500"
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
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Passenger Details</h2>
          <div className="space-y-8">
            {selectedSeats.map((seat, index) => (
              <div key={seat} className="border-b border-gray-100 last:border-0 pb-6 last:pb-0">
                <div className="flex items-center gap-2 mb-4">
                  <span className="bg-red-100 text-red-800 text-sm font-bold px-3 py-1 rounded-full">Seat {seat}</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-gray-700 mb-2">Full Name</label>
                    <input 
                      type="text" 
                      required
                      placeholder="e.g. John Doe"
                      value={passengers[index]?.name || ''}
                      onChange={(e) => handlePassengerChange(index, 'name', e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Age</label>
                    <input 
                      type="number" 
                      required
                      min="1" max="120"
                      placeholder="e.g. 25"
                      value={passengers[index]?.age || ''}
                      onChange={(e) => handlePassengerChange(index, 'age', e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Contact Details */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Contact Information</h2>
          <p className="text-sm text-gray-500 mb-6">Your ticket will be sent to these contact details.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-gray-700 mb-2">Contact Name</label>
              <input 
                type="text" 
                required
                value={customerInfo.name}
                onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Phone Number</label>
              <input 
                type="tel" 
                required
                value={customerInfo.phone}
                onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Email Address</label>
              <input 
                type="email" 
                required
                value={customerInfo.email}
                onChange={(e) => setCustomerInfo({ ...customerInfo, email: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Summary Sidebar */}
      <div className="md:w-96">
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 sticky top-24">
          <h3 className="text-xl font-bold text-gray-900 mb-6 pb-6 border-b border-gray-100">Journey Summary</h3>
          <div className="space-y-4 mb-8">
            <div className="flex justify-between items-center">
              <span className="text-gray-500 text-sm font-medium">Route</span>
              <span className="font-bold text-gray-900">{trip.route.origin} to {trip.route.destination}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500 text-sm font-medium">Departure</span>
              <span className="font-bold text-gray-900">{trip.departureTime}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500 text-sm font-medium">Bus Type</span>
              <span className="font-bold text-gray-900">{trip.bus.type}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500 text-sm font-medium">Selected Seats</span>
              <span className="font-bold text-gray-900">{selectedSeats.join(', ')}</span>
            </div>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-2xl mb-8">
            <div className="flex justify-between items-end">
              <span className="text-gray-500 font-medium">Total Fare</span>
              <span className="text-3xl font-bold text-red-600">NPR {totalFare.toLocaleString()}</span>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-50 text-red-700 text-sm rounded-xl border border-red-100">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-red-600/20 disabled:shadow-none"
          >
            {isLoading ? 'Securing Seats...' : 'Proceed to Payment'}
          </button>
        </div>
      </div>
    </form>
  );
}
