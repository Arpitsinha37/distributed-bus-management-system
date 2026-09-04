import { api } from '@/lib/api';
import { headers } from 'next/headers';
import dayjs from 'dayjs';
import { Bus, Calendar, MapPin, CheckCircle, Download } from 'lucide-react';
import { notFound } from 'next/navigation';

export default async function TicketPage({ params }: { params: { pnr: string } }) {
  const headersList = headers();
  const siteId = headersList.get('x-site-id');

  try {
    const res = await api.get(`/bookings/${params.pnr}`, {
      headers: { 'X-Site-Id': siteId }
    });
    
    const booking = res.data.data;
    if (!booking) return notFound();

    return (
      <main className="min-h-screen bg-neutral-50 py-12">
        <div className="max-w-2xl mx-auto px-4">
          
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 text-green-600 rounded-full mb-4">
              <CheckCircle className="w-8 h-8" />
            </div>
            <h1 className="text-3xl font-bold text-neutral-900">Booking Confirmed!</h1>
            <p className="text-neutral-500 mt-2">Your ticket has been sent to {booking.contactEmail}</p>
          </div>

          <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-neutral-100 relative">
            {/* Ticket Header */}
            <div className="bg-orange-600 text-white p-8">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-orange-200 text-sm font-semibold uppercase tracking-wider mb-1">E-Ticket</p>
                  <h2 className="text-3xl font-bold font-mono">{booking.pnr}</h2>
                </div>
                <div className="text-right">
                  <p className="text-orange-200 text-sm font-semibold uppercase tracking-wider mb-1">Status</p>
                  <span className="inline-block bg-white text-orange-600 px-3 py-1 rounded-full text-sm font-bold">
                    {booking.status}
                  </span>
                </div>
              </div>
            </div>

            {/* Ticket Body */}
            <div className="p-8 space-y-8">
              <div className="flex flex-col md:flex-row justify-between gap-6">
                <div>
                  <p className="text-sm text-neutral-500 mb-1">Passenger</p>
                  <p className="font-bold text-lg text-neutral-900">{booking.customerName}</p>
                </div>
                <div>
                  <p className="text-sm text-neutral-500 mb-1">Seats</p>
                  <p className="font-bold text-lg text-neutral-900">
                    {booking.seats.map((s: any) => s.seatNumber).join(', ')}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-neutral-500 mb-1">Bus</p>
                  <p className="font-bold text-lg text-neutral-900">{booking.schedule.bus.plateNumber}</p>
                </div>
              </div>

              <div className="border-t border-dashed border-neutral-200 pt-8">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 text-neutral-500">
                    <Calendar className="w-4 h-4" />
                    <span className="font-semibold">{dayjs(booking.schedule.departureTime).format('MMM D, YYYY')}</span>
                  </div>
                  <div className="text-neutral-500 text-sm">
                    Duration: {booking.schedule.route.estimatedDurationMins}m
                  </div>
                </div>

                <div className="flex items-center justify-between mt-4">
                  <div className="flex-1">
                    <p className="text-2xl font-bold text-neutral-900">{dayjs(booking.schedule.departureTime).format('HH:mm')}</p>
                    <p className="text-sm text-neutral-500 flex items-center gap-1 mt-1">
                      <MapPin className="w-3 h-3" /> {booking.schedule.route.origin}
                    </p>
                  </div>
                  
                  <div className="flex-1 flex justify-center text-orange-600">
                    <Bus className="w-8 h-8" />
                  </div>

                  <div className="flex-1 text-right">
                    <p className="text-2xl font-bold text-neutral-900">
                      {dayjs(booking.schedule.departureTime).add(booking.schedule.route.estimatedDurationMins, 'minute').format('HH:mm')}
                    </p>
                    <p className="text-sm text-neutral-500 flex items-center justify-end gap-1 mt-1">
                      <MapPin className="w-3 h-3" /> {booking.schedule.route.destination}
                    </p>
                  </div>
                </div>
              </div>

            </div>

            {/* Ticket Footer (Cutout effect) */}
            <div className="relative border-t border-dashed border-neutral-300 bg-neutral-50 p-8">
              <div className="absolute -top-4 -left-4 w-8 h-8 bg-neutral-50 rounded-full"></div>
              <div className="absolute -top-4 -right-4 w-8 h-8 bg-neutral-50 rounded-full"></div>
              
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-neutral-500 mb-1">Total Paid</p>
                  <p className="font-bold text-xl text-neutral-900">NPR {booking.totalFare}</p>
                </div>
                <button className="flex items-center gap-2 text-orange-600 font-semibold hover:bg-orange-50 px-4 py-2 rounded-lg transition-colors">
                  <Download className="w-5 h-5" />
                  Download PDF
                </button>
              </div>
            </div>
          </div>

        </div>
      </main>
    );
  } catch (error) {
    return notFound();
  }
}
