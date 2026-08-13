'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { Search } from 'lucide-react';

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
        <label className="block text-sm font-bold text-gray-700 mb-2">PNR Number</label>
        <input 
          type="text" 
          required
          placeholder="e.g. BK-2K91X"
          value={pnr}
          onChange={(e) => setPnr(e.target.value.toUpperCase())}
          className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-500 uppercase"
        />
      </div>
      <div>
        <label className="block text-sm font-bold text-gray-700 mb-2">Phone Number</label>
        <input 
          type="tel" 
          required
          placeholder="Phone used during booking"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-500"
        />
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-700 text-sm rounded-xl border border-red-100">
          {error}
        </div>
      )}

      <button 
        type="submit" 
        disabled={isLoading}
        className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-red-600/20 disabled:shadow-none flex justify-center items-center gap-2"
      >
        <Search className="w-5 h-5" />
        {isLoading ? 'Searching...' : 'Track Ticket'}
      </button>
    </form>
  );
}
