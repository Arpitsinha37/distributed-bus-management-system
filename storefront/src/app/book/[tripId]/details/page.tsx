import { api } from '@/lib/api';
import { headers } from 'next/headers';
import { notFound } from 'next/navigation';
import { TripDetail } from '@/lib/types';
import DetailsClient from './DetailsClient';

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
      <main className="min-h-screen bg-gray-50 pb-20 pt-10">
        <div className="max-w-5xl mx-auto px-4">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Passenger & Contact Details</h1>
          <DetailsClient trip={tripData} />
        </div>
      </main>
    );
  } catch (error) {
    return notFound();
  }
}
