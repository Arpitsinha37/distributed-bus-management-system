import { api } from '@/lib/api';
import { headers } from 'next/headers';
import SearchResultsClient from './SearchResultsClient';

export default async function SearchPage({
  searchParams,
}: {
  searchParams: { origin?: string; destination?: string; date?: string };
}) {
  const { origin, destination, date } = searchParams;
  const headersList = headers();
  const siteId = headersList.get('x-site-id');

  let trips = [];
  try {
    const res = await api.get('/trips/search', {
      params: { origin, destination, date },
      headers: { 'X-Site-Id': siteId }
    });
    trips = res.data;
  } catch (error) {
    console.error("Failed to fetch trips", error);
  }

  return (
    <main>
      <SearchResultsClient 
        initialTrips={trips} 
        source={origin} 
        destination={destination} 
        date={date} 
      />
    </main>
  );
}
