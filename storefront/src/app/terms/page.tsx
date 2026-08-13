import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms & Conditions | SpeedX',
  description: 'Terms and Conditions of use.',
};

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-white py-20 px-4">
      <div className="max-w-4xl mx-auto prose prose-red lg:prose-xl">
        <h1>Terms & Conditions</h1>
        <p>Last updated: August 13, 2026</p>
        
        <h2>1. Acceptance of Terms</h2>
        <p>By accessing and using this website, you accept and agree to be bound by the terms and provision of this agreement.</p>
        
        <h2>2. Booking & Cancellation</h2>
        <p>All tickets are subject to availability. Cancellations must be made at least 24 hours prior to departure for a full refund.</p>
        
        <h2>3. Luggage Policy</h2>
        <p>Each passenger is allowed one standard size luggage and one carry-on bag.</p>
      </div>
    </main>
  );
}
