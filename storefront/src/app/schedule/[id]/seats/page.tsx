import { api } from '@/lib/api';
import { headers } from 'next/headers';
import SeatClient from './SeatClient';
import { notFound } from 'next/navigation';

export default async function SeatSelectionPage({ params }: { params: { id: string } }) {
  const headersList = headers();
  const siteId = headersList.get('x-site-id');

  try {
    const res = await api.get(`/schedules/${params.id}`, {
      headers: { 'X-Site-Id': siteId }
    });
    
    const schedule = res.data.data;
    if (!schedule) return notFound();

    return (
      <main className="min-h-screen bg-neutral-50 pb-20 pt-10">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-3xl font-bold mb-8">Select Your Seats</h1>
          <SeatClient schedule={schedule} />
        </div>
      </main>
    );
  } catch (error) {
    return notFound();
  }
}
