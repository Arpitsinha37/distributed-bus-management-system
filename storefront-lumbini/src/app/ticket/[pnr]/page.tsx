import { api } from '@/lib/api';
import { headers } from 'next/headers';
import { notFound } from 'next/navigation';
import TicketClient from './TicketClient';

export default async function TicketPage({ params }: { params: { pnr: string } }) {
  const headersList = headers();
  const siteId = headersList.get('x-site-id');

  try {
    const res = await api.get(`/bookings/${params.pnr}`, {
      headers: { 'X-Site-Id': siteId }
    });
    
    const booking = res.data.data || res.data;
    if (!booking) return notFound();

    return <TicketClient booking={booking} />;
  } catch (error) {
    return notFound();
  }
}
