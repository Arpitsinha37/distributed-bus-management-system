'use client';

import { useState } from 'react';
import { api } from '@/lib/api';
import { AlertCircle, CheckCircle } from 'lucide-react';

export default function CancelClient() {
  const [pnr, setPnr] = useState('');
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<{ refundAmount: number; refundPercent: number } | null>(null);

  const handleCancel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!window.confirm('Are you sure you want to cancel this booking? This action cannot be undone.')) {
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const res = await api.post(`/bookings/cancel`, { pnr, phone });
      setResult({
        refundAmount: res.data.refundAmount,
        refundPercent: res.data.refundPercent
      });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to cancel booking. Please check your details.');
    } finally {
      setIsLoading(false);
    }
  };

  if (result) {
    return (
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 text-green-600 rounded-full mb-4">
          <CheckCircle className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-gray-900">Booking Cancelled</h2>
        <p className="text-gray-500">
          Your booking has been successfully cancelled.
        </p>
        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 inline-block text-left">
          <p className="text-sm text-gray-600">Refund Policy: <span className="font-bold text-gray-900">{result.refundPercent}%</span></p>
          <p className="text-sm text-gray-600">Refund Amount: <span className="font-bold text-red-600 text-lg">NPR {result.refundAmount.toLocaleString()}</span></p>
        </div>
        <p className="text-xs text-gray-400 mt-4">
          Refund will be processed to the original payment method within 5-7 business days.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleCancel} className="space-y-6">
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
        <AlertCircle className="w-5 h-5" />
        {isLoading ? 'Processing...' : 'Cancel Booking'}
      </button>
    </form>
  );
}
