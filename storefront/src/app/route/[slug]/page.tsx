import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { Bus, MapPin, Clock, ShieldCheck, CreditCard, ChevronRight } from 'lucide-react';
import BookingFlow from '@/components/booking/BookingFlow';

interface Props {
  params: { slug: string };
}

// Convert "pokhara-to-kathmandu" -> { origin: "Pokhara", destination: "Kathmandu", name: "Pokhara to Kathmandu" }
function parseSlug(slug: string) {
  const parts = slug.split('-to-');
  if (parts.length !== 2) return null;
  
  const origin = parts[0].charAt(0).toUpperCase() + parts[0].slice(1);
  const destination = parts[1].charAt(0).toUpperCase() + parts[1].slice(1);
  
  return {
    origin,
    destination,
    name: `${origin} to ${destination}`
  };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const route = parseSlug(params.slug);
  if (!route) {
    return { title: 'Route Not Found' };
  }

  const title = `${route.name} Tourist Bus Ticket | VIP Sofa & AC`;
  const description = `Book your tourist bus ticket from ${route.origin} to ${route.destination}. Enjoy VIP sofa seats, AC, and a comfortable night journey. Book online instantly!`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'article',
    }
  };
}

export default function RoutePage({ params }: Props) {
  const route = parseSlug(params.slug);
  
  if (!route) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center text-center px-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Route Not Found</h1>
          <p className="text-gray-500 mb-6">The route you are looking for does not exist.</p>
          <Link href="/" className="text-blue-600 font-bold hover:underline">← Go back to Home</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white overflow-hidden pt-[72px]">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />
        
        <div className="relative z-10 max-w-screen-xl mx-auto px-4 py-16 sm:py-24">
          {/* Breadcrumbs */}
          <div className="flex items-center gap-2 text-sm text-gray-400 mb-6">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-gray-200">Routes</span>
            <ChevronRight className="w-4 h-4" />
            <span className="text-white font-medium">{route.name}</span>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="inline-flex items-center gap-2 bg-red-600/20 text-red-400 text-sm font-bold px-3 py-1 rounded-full border border-red-500/30 mb-6 uppercase tracking-wider">
                <Bus className="w-4 h-4" />
                Tourist Bus Service
              </span>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6 font-display">
                <span className="block text-gray-300 text-2xl sm:text-3xl mb-2 font-medium">Bus tickets from</span>
                <span className="text-white">{route.origin}</span>
                <span className="text-red-500 mx-3">to</span>
                <span className="text-white">{route.destination}</span>
              </h1>
              <p className="text-lg text-gray-300 mb-8 max-w-xl leading-relaxed">
                Travel comfortably with our premium tourist bus services. Choose from VIP Sofa or Standard AC buses. Secure your seat instantly.
              </p>
              
              <div className="grid grid-cols-2 gap-4 sm:flex sm:gap-6 mb-8 lg:mb-0">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                  <span className="text-sm font-medium">Secure Booking</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-emerald-400" />
                  <span className="text-sm font-medium">Instant Confirmation</span>
                </div>
              </div>
            </div>

            {/* Embedded Booking Flow */}
            <div className="bg-white/10 backdrop-blur-md border border-white/20 p-6 sm:p-8 rounded-3xl shadow-2xl">
                <h3 className="text-xl font-bold mb-4 text-white">Search {route.name} Buses</h3>
                <BookingFlow 
                    initialOrigin={route.origin} 
                    initialDestination={route.destination} 
                />
            </div>
          </div>
        </div>
      </section>

      {/* SEO Content Section */}
      <section className="py-16 sm:py-24 bg-white">
        <div className="max-w-screen-xl mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">About the {route.origin} to {route.destination} Bus Journey</h2>
            
            <div className="prose prose-lg text-gray-600 prose-headings:text-gray-900 prose-a:text-red-600">
              <p>
                Traveling from <strong>{route.origin} to {route.destination}</strong> is one of the most popular and scenic bus routes in Nepal. 
                Our tourist buses offer a safe, comfortable, and reliable way to complete this journey. 
                Whether you choose a standard AC bus or upgrade to a luxury VIP sofa seater, you'll enjoy breathtaking views of the Nepalese countryside along the way.
              </p>
              
              <h3>Why Book With Us?</h3>
              <ul>
                <li><strong>Comfortable Seating:</strong> Reclining seats with ample legroom.</li>
                <li><strong>Air Conditioning:</strong> Stay cool and comfortable throughout the trip.</li>
                <li><strong>Safety First:</strong> Experienced drivers navigating the mountain terrain.</li>
                <li><strong>Convenient Stops:</strong> Scheduled breaks for meals and restrooms at quality highway restaurants.</li>
              </ul>

              <h3>How to book your ticket online</h3>
              <p>
                Booking your {route.origin} to {route.destination} bus ticket is incredibly easy:
              </p>
              <ol>
                <li>Use the search box above to select your travel date.</li>
                <li>Choose from the list of available buses (AC, Deluxe, or VIP Sofa).</li>
                <li>Select your preferred seats from the interactive seat map.</li>
                <li>Pay securely using eSewa, Khalti, or Mobile Banking.</li>
                <li>Receive your digital ticket instantly via Email and SMS!</li>
              </ol>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
