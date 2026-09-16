'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import CustomCalendar from './CustomCalendar';
import CityInput from './CityInput';
import {
  Bus,
  ArrowLeftRight,
  AlertCircle,
  X,
} from 'lucide-react';
import dayjs from 'dayjs';
import { useRouter } from 'next/navigation';

/* Animation variants */
import type { Variants } from 'framer-motion';

const pageVariants: Variants = {
  initial: { opacity: 0, y: 40 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.4, 0, 0.2, 1] } },
  exit: { opacity: 0, y: -30, transition: { duration: 0.4 } },
};

export default function BookingFlow() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [origin, setOrigin] = useState('Pokhara');
  const [destination, setDestination] = useState('Kathmandu');
  const [date, setDate] = useState<string>('');

  useEffect(() => {
    setDate(dayjs().format('YYYY-MM-DD'));
  }, []);

  const handleSwap = () => {
    const temp = origin;
    setOrigin(destination);
    setDestination(temp);
  };

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);

    // Validate inputs
    if (!origin || !destination) {
      setError('Please select both origin and destination.');
      return;
    }
    if (origin === destination) {
      setError('Origin and destination cannot be the same.');
      return;
    }
    if (!date) {
      setError('Please select a travel date.');
      return;
    }

    setLoading(true);
    try {
      // Navigate to the /search page with query parameters
      const params = new URLSearchParams({
        origin,
        destination,
        date,
      });
      router.push(`/search?${params.toString()}`);
    } catch (err: any) {
      console.error('Navigation failed', err);
      setError('Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="relative z-10 w-full">
      {/* Error Toast */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-24 left-1/2 -translate-x-1/2 z-[100] max-w-md w-full mx-4"
          >
            <div className="bg-red-50 border border-red-200 rounded-2xl px-5 py-4 shadow-xl flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-red-800">Search Error</p>
                <p className="text-sm text-red-600 mt-0.5">{error}</p>
              </div>
              <button
                onClick={() => setError(null)}
                className="text-red-400 hover:text-red-600 transition-colors shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
            {date ? (
              <CustomCalendar 
                selectedDate={dayjs(date).toDate()} 
                onChange={(d) => setDate(dayjs(d).format('YYYY-MM-DD'))} 
              />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400">Loading...</div>
            )}
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
    </div>
  );
}
