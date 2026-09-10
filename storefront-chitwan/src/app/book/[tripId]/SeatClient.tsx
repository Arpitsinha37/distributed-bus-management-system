'use client';

import { useRouter } from 'next/navigation';
import { useBookingStore } from '@/lib/store';
import { TripDetail } from '@/lib/types';
import { useEffect, useState } from 'react';
import { ArrowLeft, Snowflake, Wifi, Droplets, BedDouble, Tag, ChevronRight, Bus } from 'lucide-react';
import SeatMap from '@/components/SeatMap';

// ── Chitwan Premium Colors ──
const C = {
    surface: '#fcf9f8',
    surfaceContainer: '#f0eded',
    surfaceVariant: '#e5e2e1',
    surfaceContainerLowest: '#ffffff',
    onSurface: '#1c1b1b',
    onSurfaceVariant: '#5c3f3f',
    outline: '#916f6e',
    outlineVariant: '#e6bdbc',
    primary: '#b1002c',
    primaryContainer: '#dc143c',
    onPrimary: '#ffffff',
    onPrimaryContainer: '#fff1f0',
    secondary: '#335ab4',
    secondaryContainer: '#7da0ff',
    error: '#ba1a1a',
    errorContainer: '#ffdad6',
};

export default function SeatClient({ trip }: { trip: TripDetail }) {
  const router = useRouter();
  const { tripId, selectedSeats, toggleSeat, setTrip } = useBookingStore();
  const [holdingInProgress, setHoldingInProgress] = useState(false);
  
  useEffect(() => {
    if (tripId !== trip.tripId) {
      setTrip(trip.tripId);
    }
  }, [trip, tripId, setTrip]);

  const handleSeatClick = (seat: any) => {
    toggleSeat(seat.displayName);
  };

  const handleProceed = () => {
    if (selectedSeats.length === 0) return;
    setHoldingInProgress(true);
    router.push(`/book/${trip.tripId}/details`);
  };

  // Convert layout to what SeatMap expects
  const layout: any = trip.layout;
  const seatsData = layout?.seats || [];
  const columns = 4;
  const rows = Math.ceil(seatsData.length / columns);
  
  const mappedSeats: any[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 1; c <= columns; c++) {
      const rowChar = String.fromCharCode(65 + r);
      const seatId = `${rowChar}${c}`;
      const seatConfig = seatsData.find((s: any) => s.number === seatId);
      const dbSeat = seatConfig ? trip.seats?.find(s => s.seatNumber === seatId) : null;
      
      let bookingStatus = 'Yes';
      if (!seatConfig) bookingStatus = 'na';
      else if (dbSeat?.status === 'BOOKED' || dbSeat?.status === 'HELD') bookingStatus = 'No';

      mappedSeats.push({
        displayName: seatConfig ? seatId : 'na',
        bookingStatus,
        gender: 'none',
      });
    }
  }

  const price = Number(trip.fare);
  const cashback = 0;
  const totalAmount = (price - cashback) * selectedSeats.length;

  const amenities = trip.bus?.amenities || [];
  const amenityIcons: Record<string, React.ReactNode> = {
      'ac': <Snowflake className="w-5 h-5" />,
      'a/c': <Snowflake className="w-5 h-5" />,
      'wifi': <Wifi className="w-5 h-5" />,
      'wi-fi': <Wifi className="w-5 h-5" />,
      'water': <Droplets className="w-5 h-5" />,
      'blanket': <BedDouble className="w-5 h-5" />,
  };

  return (
    <div style={{ background: C.surface, color: C.onSurface, fontFamily: 'Inter, sans-serif' }}>
        {/* Main Content */}
        <div className="w-full mx-auto flex flex-col md:flex-row gap-6 md:gap-8">
            
            {/* Left Column: Details & Legend */}
            <div className="w-full md:w-1/3 flex flex-col gap-6 order-2 md:order-1">
                
                {/* Bus Details Card */}
                <div className="rounded-xl border shadow-sm p-6 relative overflow-hidden group" style={{ background: C.surface, borderColor: C.surfaceVariant }}>
                    <div className="absolute top-0 right-0 w-32 h-32 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110 duration-700 ease-in-out" style={{ background: `${C.primary}0d` }} />
                    <h2 className="text-xl font-semibold mb-1" style={{ color: C.onSurface }}>{trip.bus?.operator || 'Bus Operator'}</h2>
                    <p className="text-sm mb-6" style={{ color: C.onSurfaceVariant }}>{trip.bus?.type} • Departs {trip.departureTime}</p>
                    
                    {/* Amenities Grid */}
                    {amenities.length > 0 && (
                        <div className="flex justify-between items-center border-t pt-4" style={{ borderColor: C.surfaceVariant }}>
                            {amenities.slice(0, 4).map((a: string, i: number) => {
                                const iconKey = a.toLowerCase();
                                const icon = amenityIcons[iconKey] || <Bus className="w-5 h-5" />;
                                return (
                                    <div className="flex flex-col items-center gap-1.5" style={{ color: C.onSurface }} key={i}>
                                        {icon}
                                        <span className="text-xs font-medium capitalize">{a}</span>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* Price Badge */}
                    <div className="mt-5 flex items-center justify-between rounded-xl px-4 py-3" style={{ background: C.surfaceContainer }}>
                        <div>
                            <div className="text-xs font-semibold uppercase tracking-wider" style={{ color: C.onSurfaceVariant }}>Per seat</div>
                            <div className="text-2xl font-bold" style={{ color: C.primary }}>रू {price}</div>
                        </div>
                    </div>
                </div>

                {/* Desktop Booking Summary */}
                <div className="hidden lg:block rounded-xl border shadow-sm p-6 sticky top-24" style={{ background: C.surface, borderColor: C.surfaceVariant }}>
                    <h3 className="text-sm font-semibold uppercase tracking-[0.05em] mb-4 pb-3 border-b" style={{ color: C.onSurface, borderColor: C.surfaceVariant }}>
                        Booking Summary
                    </h3>
                    <div className="space-y-3 text-sm mb-5">
                        <div className="flex justify-between">
                            <span style={{ color: C.onSurfaceVariant }}>Selected Seats</span>
                            <span className="font-bold" style={{ color: C.onSurface }}>
                                {selectedSeats.length > 0 ? selectedSeats.join(', ') : '—'}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span style={{ color: C.onSurfaceVariant }}>No. of Seats</span>
                            <span className="font-medium" style={{ color: C.onSurface }}>{selectedSeats.length}</span>
                        </div>
                        <div className="flex justify-between">
                            <span style={{ color: C.onSurfaceVariant }}>Price × {selectedSeats.length}</span>
                            <span className="font-medium" style={{ color: C.onSurface }}>रू {price * selectedSeats.length}</span>
                        </div>
                    </div>
                    <div className="flex justify-between text-lg font-bold pt-4 border-t mb-5" style={{ borderColor: C.surfaceVariant }}>
                        <span style={{ color: C.onSurface }}>Total</span>
                        <span style={{ color: C.primary }}>NPR {totalAmount.toLocaleString()}</span>
                    </div>

                    <button
                        onClick={handleProceed}
                        disabled={selectedSeats.length === 0 || holdingInProgress}
                        className="w-full text-white font-bold py-3.5 rounded-lg transition-all flex items-center justify-center gap-2 group disabled:opacity-40 disabled:cursor-not-allowed hover:brightness-110 active:translate-y-0.5 duration-150"
                        style={{ background: selectedSeats.length === 0 ? C.outline : C.primary, letterSpacing: '0.05em' }}
                    >
                        {holdingInProgress ? (
                            <span className="flex items-center justify-center gap-2">
                                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                                Holding Seats...
                            </span>
                        ) : (
                            <>
                                <span>Proceed to Details</span>
                                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </>
                        )}
                    </button>
                    <p className="text-[10px] text-center mt-2" style={{ color: C.outline }}>Seats will be held on the next step</p>
                </div>
            </div>

            {/* Right Column: Seat Map */}
            <div className="w-full md:w-2/3 order-1 md:order-2 flex justify-center">
                <div className="w-full max-w-lg">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold" style={{ color: C.onSurface }}>Select Your Seats</h3>
                        {selectedSeats.length > 0 && (
                            <span className="text-xs px-3 py-1 rounded-full font-bold" style={{ background: '#ffdad9', color: '#920022' }}>
                                {selectedSeats.length} selected
                            </span>
                        )}
                    </div>
                    <SeatMap
                        seats={mappedSeats}
                        selectedSeats={selectedSeats}
                        onSeatClick={handleSeatClick}
                        price={price}
                        noofcolumn={columns}
                    />
                </div>
            </div>
        </div>

        {/* Mobile Bottom Nav Bar */}
        <nav className="lg:hidden fixed bottom-0 w-full z-50 flex justify-between items-center px-6 py-4 shadow-[0_-4px_12px_rgba(8,28,54,0.04)] rounded-t-xl left-1/2 -translate-x-1/2 max-w-7xl" style={{ background: C.surfaceContainerLowest }}>
            <div className="flex flex-col items-start justify-center">
                <span className="text-sm font-semibold" style={{ color: C.onSurface, letterSpacing: '0.05em' }}>
                    Total: NPR {totalAmount.toLocaleString()}
                </span>
                <span className="text-sm" style={{ color: C.onSurfaceVariant }}>
                    {selectedSeats.length > 0
                        ? `${selectedSeats.length} Seat${selectedSeats.length > 1 ? 's' : ''} Selected (${selectedSeats.join(', ')})`
                        : 'Select seats to continue'}
                </span>
            </div>
            <button
                onClick={handleProceed}
                disabled={selectedSeats.length === 0 || holdingInProgress}
                className="flex flex-row items-center justify-center text-white rounded-lg px-6 py-3 gap-2 hover:brightness-110 transition-all active:translate-y-0.5 duration-150 group disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ background: selectedSeats.length === 0 ? C.outline : C.primary, letterSpacing: '0.05em' }}
            >
                <span className="text-sm font-bold">
                    {holdingInProgress ? 'Holding...' : 'Proceed'}
                </span>
                {!holdingInProgress && <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
            </button>
        </nav>
    </div>
  );
}
