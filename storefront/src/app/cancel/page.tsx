import { Metadata } from 'next';
import CancelClient from './CancelClient';

export const metadata: Metadata = {
  title: 'Cancel Booking | SpeedX',
  description: 'Cancel your bus ticket',
};

export default function CancelPage() {
  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Cancel Ticket</h1>
        <p className="text-gray-500 mb-8">Enter your details to initiate a cancellation and refund.</p>
        <CancelClient />
      </div>
    </main>
  );
}
