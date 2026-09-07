'use client';

import { useRouter } from 'next/navigation';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useBookingStore } from '@/lib/store';
import { TripDetail } from '@/lib/types';
import { useEffect } from 'react';

export default function SeatClient({ trip }: { trip: TripDetail }) {
  const router = useRouter();
  const { tripId, selectedSeats, toggleSeat, setTrip } = useBookingStore();
  
  useEffect(() => {
    if (tripId !== trip.tripId) {
      setTrip(trip.tripId);
    }
  }, [trip, tripId, setTrip]);

  const layout: any = trip.layout;

  const handleContinue = () => {
    if (selectedSeats.length === 0) return;
    router.push(`/book/${trip.tripId}/details`);
  };

  // Helper to render the grid
  // The seeder sets up a 32-seat layout as { seats: [ { number: 'A1', type: 'window' }, ... ] }
  // Let's deduce rows and columns from the layout data.
  const seatsData = layout.seats || [];
  // Assuming standard 2x2 layout, 4 seats per row.
  const columns = 4;
  const rows = Math.ceil(seatsData.length / columns);
  
  const gridCells = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 1; c <= columns; c++) {
      const rowChar = String.fromCharCode(65 + r); // A, B, C...
      const seatId = `${rowChar}${c}`;
      const seatConfig = seatsData.find((s: any) => s.number === seatId);
      const dbSeat = seatConfig ? trip.seats.find(s => s.seatNumber === seatId) : null;
      gridCells.push({ row: r, col: c, seatConfig, status: dbSeat?.status || 'AVAILABLE', seatId });
    }
  }

  const totalFare = selectedSeats.length * Number(trip.fare);

  return (
    <div className="flex flex-col md:flex-row gap-8">
      {/* Bus Layout Render */}
      <div className="flex-1 bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
        <div className="w-full flex justify-end mb-10">
          <div className="w-12 h-12 border-2 border-gray-200 rounded-full flex items-center justify-center bg-gray-50">
            <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">Wheel</span>
          </div>
        </div>

        <div 
          className="grid gap-4 mx-auto max-w-sm"
          style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
        >
          {gridCells.map((cell, idx) => {
            if (!cell.seatConfig) {
              return <div key={idx} className="w-12 h-12"></div>;
            }

            const isSelected = selectedSeats.includes(cell.seatId);
            const isBooked = cell.status === 'BOOKED' || cell.status === 'HELD';

            return (
              <button
                key={idx}
                disabled={isBooked}
                onClick={() => toggleSeat(cell.seatId)}
                className={twMerge(
                  clsx(
                    "w-12 h-14 rounded-t-2xl rounded-b-lg border-2 flex items-center justify-center font-bold text-sm transition-all relative overflow-hidden",
                    isBooked 
                      ? "bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed"
                      : isSelected
                        ? "bg-red-600 border-red-600 text-white shadow-lg shadow-red-600/30"
                        : "bg-white border-gray-200 text-gray-600 hover:border-red-400 hover:text-red-500"
                  )
                )}
              >
                {cell.seatId}
              </button>
            );
          })}
        </div>
        
        <div className="mt-12 flex items-center justify-center gap-6 border-t border-gray-100 pt-6">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full border-2 border-gray-200 bg-white"></div>
            <span className="text-sm text-gray-500 font-medium">Available</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full border-2 border-gray-200 bg-gray-100"></div>
            <span className="text-sm text-gray-500 font-medium">Booked</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-red-600 border-2 border-red-600"></div>
            <span className="text-sm text-gray-500 font-medium">Selected</span>
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
              <span className="font-bold text-gray-900">{selectedSeats.length > 0 ? selectedSeats.join(', ') : '-'}</span>
            </div>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-2xl mb-8">
            <div className="flex justify-between items-end">
              <span className="text-gray-500 font-medium">Total Fare</span>
              <span className="text-3xl font-bold text-red-600">NPR {totalFare.toLocaleString()}</span>
            </div>
          </div>

          <button
            onClick={handleContinue}
            disabled={selectedSeats.length === 0}
            className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-red-600/20 disabled:shadow-none"
          >
            Continue to Details
          </button>
        </div>
      </div>
    </div>
  );
}
