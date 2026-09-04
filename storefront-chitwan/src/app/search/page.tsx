import { api } from '@/lib/api';
import { headers } from 'next/headers';
import dayjs from 'dayjs';
import Link from 'next/link';
import { Bus, Clock, MapPin, ArrowRight } from 'lucide-react';

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
    <main className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-gray-900 text-white py-12">
        <div className="max-w-5xl mx-auto px-4">
          <h1 className="text-3xl font-bold mb-2">Search Results</h1>
          <p className="text-gray-400 flex items-center gap-2">
            {origin} <ArrowRight className="w-4 h-4" /> {destination} • {dayjs(date).format('MMMM D, YYYY')}
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 mt-8 space-y-4">
        {trips.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-gray-100">
            <Bus className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900">No buses found</h3>
            <p className="text-gray-500">Try modifying your search criteria.</p>
            <Link href="/" className="inline-block mt-6 text-red-600 font-bold hover:underline">
              Go back to search
            </Link>
          </div>
        ) : (
          trips.map((trip: any) => (
            <div key={trip.tripId} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:shadow-md transition-shadow">
              
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <span className="px-3 py-1 bg-red-100 text-red-800 text-xs font-bold uppercase rounded-full tracking-wider">
                    {trip.bus.type}
                  </span>
                  <span className="text-gray-500 text-sm flex items-center gap-1">
                    <Clock className="w-4 h-4" /> 
                    Available Seats: {trip.availableSeats}
                  </span>
                </div>

                <div className="flex items-center justify-between max-w-sm">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-900">{trip.departureTime}</p>
                    <p className="text-sm text-gray-500">{trip.route.origin}</p>
                  </div>
                  <div className="flex-1 px-4 flex items-center justify-center relative">
                    <div className="w-full h-px border-t-2 border-dashed border-gray-300"></div>
                    <Bus className="absolute text-gray-400 w-5 h-5 bg-white px-1" />
                  </div>
                  <div className="text-center">
                    {/* Simplified arrival time for MVP, assumes 6 hours if not specified. Real app should use estimatedDuration. */}
                    <p className="text-2xl font-bold text-gray-900">
                      {dayjs(`${date}T${trip.departureTime}`).add(6, 'hour').format('HH:mm')}
                    </p>
                    <p className="text-sm text-gray-500">{trip.route.destination}</p>
                  </div>
                </div>
                
                {trip.bus.amenities && trip.bus.amenities.length > 0 && (
                  <div className="flex gap-2 mt-4">
                    {trip.bus.amenities.slice(0, 3).map((amenity: string, idx: number) => (
                      <span key={idx} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                        {amenity}
                      </span>
                    ))}
                    {trip.bus.amenities.length > 3 && (
                      <span className="text-xs text-gray-400 py-1">+{trip.bus.amenities.length - 3} more</span>
                    )}
                  </div>
                )}
              </div>

              <div className="md:w-48 md:border-l md:border-gray-100 md:pl-6 flex flex-col justify-center">
                <div className="mb-4">
                  <p className="text-sm text-gray-500 mb-1">Starting from</p>
                  <p className="text-3xl font-bold text-gray-900">NPR {trip.fare}</p>
                </div>
                <Link 
                  href={`/book/${trip.tripId}`}
                  className="w-full block text-center bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-xl shadow-md transition-colors"
                >
                  View Seats
                </Link>
              </div>

            </div>
          ))
        )}
      </div>
    </main>
  );
}
