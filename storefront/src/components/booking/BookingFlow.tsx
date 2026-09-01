'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import CustomCalendar from './CustomCalendar';
import CityInput from './CityInput';
import {
  Bus,
  MapPin,
  Calendar,
  ArrowRight,
  ArrowLeft,
  Users,
  Star,
  ArrowLeftRight,
} from 'lucide-react';
import { api } from '@/lib/api';
import dayjs from 'dayjs';
import { useRouter } from 'next/navigation';
import { useBookingStore } from '@/lib/store';

type FlowState = 'SEARCH' | 'TRIPS' | 'SEATS';

/* Star-burst SVG icon */
const StarBurst = ({ className = '' }: { className?: string }) => (
  <svg
    width="8"
    height="8"
    viewBox="0 0 8 8"
    fill="none"
    className={className}
  >
    <path
      d="M8 0C8 0 7.32 2.42 7.32 4C7.32 5.58 8 8 8 8C8 8 5.58 7.32 4 7.32C2.42 7.32 0 8 0 8C0 8 .68 5.58 .68 4C.68 2.42 0 0 0 0C0 0 2.42 .68 4 .68C5.58 .68 8 0 8 0Z"
      fill="currentColor"
    />
  </svg>
);

/* Section Label */
function SectionLabel({ icon, text }: { icon?: React.ReactNode; text: string }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      {icon || (
        <div className="w-5 h-5 rounded-full border border-white/20 flex items-center justify-center">
          <Bus className="w-2.5 h-2.5 text-white/60" />
        </div>
      )}
      <span className="text-[0.8125rem] font-medium text-white/50 tracking-wide">
        {text}
      </span>
    </div>
  );
}

/* Animation variants */
import type { Variants } from 'framer-motion';

const pageVariants: Variants = {
  initial: { opacity: 0, y: 40 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.4, 0, 0.2, 1] } },
  exit: { opacity: 0, y: -30, transition: { duration: 0.4 } },
};

const staggerContainer: Variants = {
  animate: { transition: { staggerChildren: 0.08 } },
};

const staggerItem: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] } },
};

export default function BookingFlow() {
  const router = useRouter();
  const [step, setStep] = useState<FlowState>('SEARCH');
  const [loading, setLoading] = useState(false);
  const [trips, setTrips] = useState<any[]>([]);

  const [origin, setOrigin] = useState('Pokhara');
  const [destination, setDestination] = useState('Kathmandu');
  const [date, setDate] = useState(dayjs().format('YYYY-MM-DD'));

  const [selectedTrip, setSelectedTrip] = useState<any>(null);
  const { selectedSeats, toggleSeat, setTrip } = useBookingStore();

  const handleSwap = () => {
    const temp = origin;
    setOrigin(destination);
    setDestination(temp);
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.get('/trips/search', {
        params: { origin, destination, date },
      });
      setTrips(res.data);
      setStep('TRIPS');
    } catch (error) {
      console.error('Failed to fetch trips', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectTrip = (trip: any) => {
    setSelectedTrip(trip);
    setTrip(trip.tripId);
    setStep('SEATS');
  };

  const handleContinue = () => {
    if (selectedSeats.length === 0) return;
    router.push(`/book/${selectedTrip.tripId}/details`);
  };

  /* ───────────── SEARCH SCREEN ───────────── */
  const renderSearch = () => {
    // Generate quick dates
    const today = dayjs();
    const quickDates = [
      { label: 'Today', date: today.format('YYYY-MM-DD'), isSpecial: true },
      { label: 'Tomorrow', date: today.add(1, 'day').format('YYYY-MM-DD'), isSpecial: true },
      { label: today.add(2, 'day').format('MMM DD'), date: today.add(2, 'day').format('YYYY-MM-DD') },
      { label: today.add(3, 'day').format('MMM DD'), date: today.add(3, 'day').format('YYYY-MM-DD') },
      { label: today.add(4, 'day').format('MMM DD'), date: today.add(4, 'day').format('YYYY-MM-DD') },
    ];

    return (
      <motion.div
        key="SEARCH"
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        className="w-full max-w-5xl mx-auto mt-12 mb-16 relative"
      >
        <div className="bg-white rounded-[2.5rem] shadow-2xl relative flex flex-col md:flex-row items-stretch min-h-[100px] border border-gray-100">
          
          {/* Origin */}
          <div className="flex-1 relative flex flex-col justify-center border-b md:border-b-0 md:border-r border-gray-200">
            <CityInput
              label="From"
              placeholder="Leaving from"
              value={origin}
              onChange={setOrigin}
              excludeCity={destination}
            />

            {/* Swap Button */}
            <button
              type="button"
              onClick={handleSwap}
              className="absolute -bottom-5 left-1/2 md:-right-5 md:left-auto md:top-1/2 -translate-x-1/2 md:translate-x-0 md:-translate-y-1/2 z-10 w-10 h-10 bg-white border border-gray-200 rounded-full flex items-center justify-center text-slate-500 hover:text-slate-800 shadow-sm transition-colors group"
            >
              <ArrowLeftRight className="w-4 h-4 group-hover:text-[#E31837] group-hover:rotate-180 transition-all duration-300" />
            </button>
          </div>

          {/* To */}
          <div className="flex-1 flex flex-col justify-center border-b md:border-b-0 md:border-r border-gray-200">
            <CityInput
              label="To"
              placeholder="Going to"
              value={destination}
              onChange={setDestination}
              excludeCity={origin}
            />
          </div>

          {/* Date & Quick Dates */}
          <div className="flex-[1.5] flex flex-col justify-center relative">
            <CustomCalendar 
              selectedDate={dayjs(date).toDate()} 
              onChange={(d) => setDate(dayjs(d).format('YYYY-MM-DD'))} 
            />
          </div>

          {/* Submit Button */}
          <div className="flex-none flex p-2 md:p-3 items-center justify-center border-t md:border-t-0 md:border-l border-gray-200">
            <button
              onClick={handleSearch}
              disabled={loading}
              className="w-full md:w-auto h-full bg-[#E31837] hover:bg-[#C9132E] text-white font-bold text-sm md:text-base tracking-wide px-10 py-4 rounded-full shadow-lg transition-transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50 min-h-[3.5rem] md:min-h-[4rem]"
            >
              {loading ? (
                <span className="animate-pulse">Searching...</span>
              ) : (
                <>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                  </svg>
                  <span className="whitespace-nowrap">SEARCH BUSES</span>
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    );
  };

  /* ───────────── TRIPS SCREEN ───────────── */
  const renderTrips = () => (
    <motion.div
      key="TRIPS"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="max-w-[90rem] mx-auto px-6 md:px-12 pt-28 pb-20"
    >
      {/* Back */}
      <button
        onClick={() => setStep('SEARCH')}
        className="flex items-center gap-2 text-[0.8125rem] text-white/40 hover:text-white transition-colors mb-12 group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        Back to Search
      </button>

      {/* Header */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-16">
        <div className="md:col-span-3">
          <SectionLabel text="Results" />
        </div>
        <div className="md:col-span-9">
          <h2 className="text-3xl md:text-5xl font-display font-bold text-white mb-4">
            Available Buses
          </h2>
          <p className="text-white/40 text-lg">
            {origin} → {destination} &bull;{' '}
            {dayjs(date).format('MMMM D, YYYY')}
          </p>
        </div>
      </div>

      {/* Trip list */}
      <motion.div
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        className="space-y-4"
      >
        {trips.length === 0 ? (
          <div className="glass-static rounded-2xl p-16 text-center">
            <Bus className="w-12 h-12 text-white/15 mx-auto mb-6" />
            <h3 className="text-xl font-display font-semibold text-white mb-2">
              No trips found
            </h3>
            <p className="text-white/40 mb-8">
              Try selecting a different date or route.
            </p>
            <button
              onClick={() => setStep('SEARCH')}
              className="btn-outline"
            >
              Modify Search
            </button>
          </div>
        ) : (
          trips.map((trip: any) => (
            <motion.div
              key={trip.tripId}
              variants={staggerItem}
              onClick={() => handleSelectTrip(trip)}
              className="glass rounded-2xl p-6 md:p-8 cursor-pointer group transition-all duration-500 hover:border-brand-green/20"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                {/* Left: Trip info */}
                <div className="flex-1">
                  {/* Tags */}
                  <div className="flex items-center gap-3 mb-6">
                    <span className="text-[0.6875rem] font-semibold uppercase tracking-[0.15em] text-brand-green bg-brand-green/10 px-3 py-1 rounded-full">
                      {trip.bus.type}
                    </span>
                    <span className="text-[0.8125rem] text-white/40 flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5" />
                      {trip.availableSeats} seats left
                    </span>
                  </div>

                  {/* Time strip */}
                  <div className="flex items-center gap-6 max-w-md">
                    <div>
                      <div className="text-2xl md:text-3xl font-display font-bold text-white">
                        {trip.departureTime}
                      </div>
                      <div className="text-[0.8125rem] text-white/40 mt-1">
                        {trip.route.origin}
                      </div>
                    </div>

                    <div className="flex-1 relative flex items-center">
                      <div className="w-full h-px border-t border-dashed border-white/15" />
                      <Bus className="absolute left-1/2 -translate-x-1/2 w-4 h-4 text-white/20 group-hover:text-brand-green group-hover:translate-x-2 transition-all duration-700" />
                    </div>

                    <div>
                      <div className="text-2xl md:text-3xl font-display font-bold text-white">
                        {dayjs(`${date}T${trip.departureTime}`)
                          .add(6, 'hour')
                          .format('HH:mm')}
                      </div>
                      <div className="text-[0.8125rem] text-white/40 mt-1">
                        {trip.route.destination}
                      </div>
                    </div>
                  </div>

                  {/* Amenities */}
                  {trip.bus.amenities?.length > 0 && (
                    <div className="flex gap-2 mt-5">
                      {trip.bus.amenities
                        .slice(0, 3)
                        .map((a: string, i: number) => (
                          <span
                            key={i}
                            className="text-[0.6875rem] text-white/30 border border-white/[0.06] rounded-full px-3 py-1"
                          >
                            {a}
                          </span>
                        ))}
                    </div>
                  )}
                </div>

                {/* Right: Price + CTA */}
                <div className="md:border-l md:border-white/[0.06] md:pl-8 flex flex-col items-end md:items-start min-w-[160px]">
                  <div className="text-[0.8125rem] text-white/40 mb-1">
                    from
                  </div>
                  <div className="text-2xl md:text-3xl font-display font-bold text-white mb-4">
                    NPR {trip.fare}
                  </div>
                  <div className="flex items-center gap-2 text-[0.8125rem] font-semibold text-brand-green opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0 transition-all duration-500">
                    Select Seats <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </motion.div>
    </motion.div>
  );

  /* ───────────── SEATS SCREEN ───────────── */
  const renderSeats = () => {
    if (!selectedTrip) return null;
    const layout = selectedTrip.layout;
    const seatsData = layout?.seats || [];
    const columns = 4;
    const rows = Math.ceil(seatsData.length / columns);

    const gridCells = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 1; c <= columns; c++) {
        const rowChar = String.fromCharCode(65 + r);
        const seatId = `${rowChar}${c}`;
        const seatConfig = seatsData.find((s: any) => s.number === seatId);
        const dbSeat = seatConfig
          ? selectedTrip.seats?.find((s: any) => s.seatNumber === seatId)
          : null;
        gridCells.push({
          seatConfig,
          status: dbSeat?.status || 'AVAILABLE',
          seatId,
        });
      }
    }

    const totalFare = selectedSeats.length * Number(selectedTrip.fare);

    return (
      <motion.div
        key="SEATS"
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        className="max-w-[90rem] mx-auto px-6 md:px-12 pt-28 pb-20"
      >
        {/* Back */}
        <button
          onClick={() => setStep('TRIPS')}
          className="flex items-center gap-2 text-[0.8125rem] text-white/40 hover:text-white transition-colors mb-12 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Trips
        </button>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Seat map */}
          <div className="flex-1">
            <SectionLabel text="Seat Selection" />
            <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-10">
              Choose your seat
            </h2>

            <div className="glass-static rounded-2xl p-8 md:p-10">
              {/* Driver indicator */}
              <div className="flex justify-end mb-10">
                <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center">
                  <span className="text-[0.5625rem] text-white/30 font-semibold uppercase tracking-widest">
                    Driver
                  </span>
                </div>
              </div>

              {/* Grid */}
              <div
                className="grid gap-3 mx-auto max-w-xs"
                style={{
                  gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
                }}
              >
                {gridCells.map((cell, idx) => {
                  if (!cell.seatConfig)
                    return <div key={idx} className="w-[3.25rem] h-[3.75rem]" />;

                  const isSelected = selectedSeats.includes(cell.seatId);
                  const isBooked =
                    cell.status === 'BOOKED' || cell.status === 'HELD';

                  return (
                    <button
                      key={idx}
                      disabled={isBooked}
                      onClick={() => toggleSeat(cell.seatId)}
                      className={`seat-btn ${isSelected ? 'selected' : ''}`}
                    >
                      {cell.seatId}
                    </button>
                  );
                })}
              </div>

              {/* Legend */}
              <div className="mt-10 pt-6 border-t border-white/[0.06] flex justify-center gap-8">
                <div className="flex items-center gap-2">
                  <div className="w-3.5 h-3.5 rounded border border-white/12 bg-white/[0.03]" />
                  <span className="text-[0.75rem] text-white/40">
                    Available
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3.5 h-3.5 rounded border border-white/5 bg-white/[0.02]" />
                  <span className="text-[0.75rem] text-white/40">Booked</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3.5 h-3.5 rounded bg-brand-green" />
                  <span className="text-[0.75rem] text-white/40">
                    Selected
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Summary sidebar */}
          <div className="lg:w-[22rem]">
            <div className="glass-static rounded-2xl p-8 sticky top-28">
              <h3 className="text-lg font-display font-semibold text-white mb-6 pb-6 border-b border-white/[0.06]">
                Journey Summary
              </h3>

              <div className="space-y-4 mb-8">
                {[
                  {
                    label: 'Route',
                    value: `${selectedTrip.route.origin} → ${selectedTrip.route.destination}`,
                  },
                  { label: 'Departure', value: selectedTrip.departureTime },
                  { label: 'Class', value: selectedTrip.bus.type },
                  {
                    label: 'Seats',
                    value:
                      selectedSeats.length > 0
                        ? selectedSeats.join(', ')
                        : '—',
                  },
                ].map((row, i) => (
                  <div
                    key={i}
                    className="flex justify-between items-center text-[0.875rem]"
                  >
                    <span className="text-white/40">{row.label}</span>
                    <span className="text-white font-medium">{row.value}</span>
                  </div>
                ))}
              </div>

              {/* Total */}
              <div className="bg-white/[0.04] rounded-xl p-5 mb-8">
                <div className="flex justify-between items-end">
                  <span className="text-[0.875rem] text-white/40">
                    Total Fare
                  </span>
                  <span className="text-2xl font-display font-bold text-brand-green">
                    NPR {totalFare.toLocaleString()}
                  </span>
                </div>
              </div>



              <button
                onClick={handleContinue}
                disabled={selectedSeats.length === 0}
                className="btn-accent w-full justify-center py-4 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:transform-none disabled:hover:shadow-none"
              >
                Continue to Details
                <StarBurst />
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="relative z-10 w-full">
      <AnimatePresence mode="wait">
        {step === 'SEARCH' && renderSearch()}
        {step === 'TRIPS' && renderTrips()}
        {step === 'SEATS' && renderSeats()}
      </AnimatePresence>
    </div>
  );
}
