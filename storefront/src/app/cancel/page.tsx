import { Metadata } from 'next';
import CancelClient from './CancelClient';
import { AlertTriangle } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Cancel Booking | Pokhara Travels',
  description: 'Cancel your bus ticket',
};

export default function CancelPage() {
  return (
    <main className="min-h-screen pt-28 pb-20 flex flex-col items-center justify-center px-6">
      
      <div className="w-full max-w-lg">
        <div className="text-center mb-10">
          <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="w-6 h-6 text-red-500" />
          </div>
          <h1 className="text-3xl md:text-4xl font-display font-bold text-white mb-4">
            Cancel Ticket
          </h1>
          <p className="text-white/50">
            Enter your details to initiate a cancellation and refund.
          </p>
        </div>

        <div className="glass rounded-3xl p-8 md:p-10 shadow-2xl shadow-black/40">
          <CancelClient />
        </div>
      </div>
      
    </main>
  );
}
