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
      <main className="min-h-screen bg-gray-50 pt-[72px] pb-24 font-sans">
        <DetailsClient trip={tripData} />
      </main>
    );
  } catch (error) {
    return notFound();
  }
}
