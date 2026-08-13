'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export default function SeatClient({ schedule }: { schedule: any }) {
  const router = useRouter();
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  
  // The layout JSON structure we defined in the backend API
  // e.g. { rows: 10, columns: 4, seats: [{ id: '1A', row: 1, col: 1, type: 'SEAT' }, ...] }
  const layout = schedule.bus.seatLayout.gridData;

  const toggleSeat = (seatId: string) => {
    setSelectedSeats(prev => 
      prev.includes(seatId) 
        ? prev.filter(s => s !== seatId)
        : [...prev, seatId]
    );
  };

  const handleContinue = () => {
    if (selectedSeats.length === 0) return;
    const params = new URLSearchParams();
    params.set('seats', selectedSeats.join(','));
    router.push(`/schedule/${schedule.id}/checkout?${params.toString()}`);
  };

  // Helper to render the grid
  const gridCells = [];
  for (let r = 1; r <= layout.rows; r++) {
    for (let c = 1; c <= layout.columns; c++) {
      const seat = layout.seats.find((s: any) => s.row === r && s.column === c);
      gridCells.push({ row: r, col: c, seat });
    }
  }

  const totalFare = selectedSeats.length * schedule.baseFare;

  return (
    <div className="flex flex-col md:flex-row gap-8">
      {/* Bus Layout Render */}
      <div className="flex-1 bg-white p-8 rounded-2xl shadow-sm border border-neutral-200">
        <div className="w-full flex justify-end mb-8">
          <div className="w-12 h-12 border-2 border-neutral-300 rounded-full flex items-center justify-center">
            <span className="text-xs text-neutral-400 font-bold">Wheel</span>
          </div>
        </div>

        <div 
          className="grid gap-4 mx-auto"
          style={{ gridTemplateColumns: `repeat(${layout.columns}, minmax(0, 1fr))` }}
        >
          {gridCells.map((cell, idx) => {
            if (!cell.seat || cell.seat.type === 'EMPTY') {
              return <div key={idx} className="w-12 h-12"></div>;
            }

            const isSelected = selectedSeats.includes(cell.seat.id);
            const isBooked = false; // In MVP we assume available. Later fetch locked/booked seats.

            return (
              <button
                key={idx}
                disabled={isBooked}
                onClick={() => toggleSeat(cell.seat.id)}
                className={twMerge(
                  clsx(
                    "w-12 h-14 rounded-t-xl rounded-b-md border-2 flex items-center justify-center font-bold text-sm transition-all",
                    isBooked 
                      ? "bg-neutral-200 border-neutral-300 text-neutral-400 cursor-not-allowed"
                      : isSelected
                        ? "bg-orange-600 border-orange-600 text-white"
                        : "bg-white border-neutral-300 text-neutral-600 hover:border-orange-500"
                  )
                )}
              >
                {cell.seat.id}
              </button>
            );
          })}
        </div>
      </div>

      {/* Summary Sidebar */}
      <div className="md:w-80">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-200 sticky top-10">
          <h3 className="text-xl font-bold mb-4 border-b pb-4">Journey Summary</h3>
          <div className="space-y-4 mb-6">
            <div className="flex justify-between text-sm">
              <span className="text-neutral-500">Route</span>
              <span className="font-semibold text-right">{schedule.route.origin} to {schedule.route.destination}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-neutral-500">Bus</span>
              <span className="font-semibold text-right">{schedule.bus.plateNumber}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-neutral-500">Selected Seats</span>
              <span className="font-semibold text-right">{selectedSeats.length > 0 ? selectedSeats.join(', ') : '-'}</span>
            </div>
          </div>
          
          <div className="border-t pt-4 mb-6">
            <div className="flex justify-between items-end">
              <span className="text-neutral-500">Total Fare</span>
              <span className="text-3xl font-bold text-neutral-900">NPR {totalFare}</span>
            </div>
          </div>

          <button
            onClick={handleContinue}
            disabled={selectedSeats.length === 0}
            className="w-full bg-orange-600 hover:bg-orange-700 disabled:bg-neutral-300 disabled:cursor-not-allowed text-white font-semibold py-4 rounded-xl transition-colors"
          >
            Continue to Checkout
          </button>
        </div>
      </div>
    </div>
  );
}
