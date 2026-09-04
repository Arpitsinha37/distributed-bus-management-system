import { Metadata } from 'next';
import TrackClient from './TrackClient';
import { Search } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Track Booking | Pokhara Travels',
  description: 'Track your bus booking status and download your e-ticket.',
};

export default function TrackPage() {
  return (
    <main className="min-h-screen pt-28 pb-20 flex flex-col items-center justify-center px-6">
      
      <div className="w-full max-w-lg">
        <div className="text-center mb-10">
          <div className="w-16 h-16 rounded-full bg-brand-green/10 border border-brand-green/20 flex items-center justify-center mx-auto mb-6">
            <Search className="w-6 h-6 text-brand-green" />
          </div>
          <h1 className="text-3xl md:text-4xl font-display font-bold text-white mb-4">
            Track Your Journey
          </h1>
          <p className="text-white/50">
            Enter your PNR and phone number to view your ticket and live status.
          </p>
        </div>

        <div className="glass rounded-3xl p-8 md:p-10 shadow-2xl shadow-black/40">
          <TrackClient />
        </div>
      </div>
      
    </main>
  );
}
