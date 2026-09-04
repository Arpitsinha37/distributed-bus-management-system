import { api } from '@/lib/api';
import { headers } from 'next/headers';
import { notFound } from 'next/navigation';
import { TripDetail } from '@/lib/types';
import DetailsClient from './DetailsClient';
import { User } from 'lucide-react';

export default async function BookingDetailsPage({ params }: { params: { tripId: string } }) {
  const headersList = headers();
  const siteId = headersList.get('x-site-id');

  try {
    const res = await api.get(`/trips/${params.tripId}`, {
      headers: { 'X-Site-Id': siteId }
    });
    
    const tripData: TripDetail = res.data;
    if (!tripData) return notFound();

    return (
      <main className="min-h-screen pt-28 pb-20">
        <div className="max-w-[90rem] mx-auto px-6 md:px-12">
          
          <div className="flex items-center gap-4 mb-10">
             <div className="w-12 h-12 rounded-full bg-brand-green/10 border border-brand-green/20 flex items-center justify-center">
                <User className="w-5 h-5 text-brand-green" />
             </div>
             <div>
               <p className="text-[0.6875rem] font-semibold text-brand-green uppercase tracking-[0.25em] mb-1">
                 Checkout Step 1
               </p>
               <h1 className="text-3xl md:text-4xl font-display font-bold text-white">Passenger Details</h1>
             </div>
          </div>

          <DetailsClient trip={tripData} />
        </div>
      </main>
    );
  } catch (error) {
    return notFound();
  }
}
