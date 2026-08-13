import { Metadata } from 'next';
import TrackClient from './TrackClient';

export const metadata: Metadata = {
  title: 'Track Booking | SpeedX',
  description: 'Track your bus booking status',
};

export default function TrackPage() {
  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Track Your Booking</h1>
        <p className="text-gray-500 mb-8">Enter your PNR and phone number to view your ticket.</p>
        <TrackClient />
      </div>
    </main>
  );
}
