'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';

/* Star-burst SVG icon */
const StarBurst = () => (
  <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
    <path
      d="M8 0C8 0 7.32 2.42 7.32 4C7.32 5.58 8 8 8 8C8 8 5.58 7.32 4 7.32C2.42 7.32 0 8 0 8C0 8 .68 5.58 .68 4C.68 2.42 0 0 0 0C0 0 2.42 .68 4 .68C5.58 .68 8 0 8 0Z"
      fill="#0D2E37"
    />
  </svg>
);

export default function TrackClient() {
  const router = useRouter();
  const [pnr, setPnr] = useState('');
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const res = await api.get(`/bookings/track`, {
        params: { pnr, phone }
      });
      router.push(`/ticket/${res.data.bookingRef}`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to find booking. Please check your details.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleTrack} className="space-y-6">
      <div>
        <label className="block text-[0.6875rem] font-semibold text-white/30 uppercase tracking-[0.15em] mb-3">
          PNR Number
        </label>
        <input 
          type="text" 
          required
          placeholder="e.g. BK-2K91X"
          value={pnr}
          onChange={(e) => setPnr(e.target.value.toUpperCase())}
          className="input-dark-simple uppercase"
        />
      </div>
      
      <div>
        <label className="block text-[0.6875rem] font-semibold text-white/30 uppercase tracking-[0.15em] mb-3">
          Phone Number
        </label>
        <input 
          type="tel" 
          required
          placeholder="Phone used during booking"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="input-dark-simple"
        />
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl">
          {error}
        </div>
      )}

      <button 
        type="submit" 
        disabled={isLoading}
        className="btn-accent w-full justify-center py-4 text-sm mt-4 disabled:opacity-50"
      >
        {isLoading ? 'Searching...' : (
          <>Find Ticket <StarBurst /></>
        )}
      </button>
    </form>
  );
}
