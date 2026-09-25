import { Metadata } from 'next';
import Link from 'next/link';
import {
  Armchair, Bus, Zap, Shield, Wifi, Snowflake, Coffee, Check, ArrowRight
} from 'lucide-react';
import BookingFlow from '@/components/booking/BookingFlow';

export const metadata: Metadata = {
  title: 'Pokhara to Kathmandu Sofa Bus Ticket – Book VIP Sofa Online',
  description:
    'Book the luxury 2+1 VIP sofa bus from Pokhara to Kathmandu. Reclining sofa seats, AC, WiFi, charging ports, and more. Instant booking from Rs 1,800.',
  alternates: { canonical: '/pokhara-to-kathmandu-sofa-bus' },
  openGraph: {
    title: 'Pokhara to Kathmandu Sofa Bus Ticket – VIP 2+1 Seating',
    description: 'Book the luxury VIP sofa bus from Pokhara to Kathmandu. Reclining seats, AC, WiFi. Book your 2+1 sofa seat online now.',
    locale: 'en_NP',
  },
};

export default function SofaBusPage() {
  return (
    <div className="w-full">
      {/* Hero */}
      <section
        className="hero-image flex flex-col items-center justify-center text-center px-6"
        style={{ backgroundImage: "url('/images/hero.jpg')" }} // Ideally a photo of sofa interior
      >
        <div className="pt-32 pb-16 md:pt-40 md:pb-16 max-w-5xl mx-auto w-full">
          <p className="text-[0.6875rem] font-semibold text-[#E31837] uppercase tracking-[0.25em] mb-6">
            Luxury VIP Sofa Bus
          </p>
          <h1 className="text-[clamp(2rem,5vw,4.5rem)] font-display font-bold text-white leading-[1.05] tracking-tight mb-6">
            Pokhara to Kathmandu Sofa Bus Ticket
          </h1>
          <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto leading-relaxed mb-10">
            Experience premium comfort with our 2+1 VIP sofa buses. Reclining seats, extra legroom, AC, and WiFi make your journey between Pokhara and Kathmandu unforgettable.
          </p>
          <BookingFlow />
        </div>
      </section>

      {/* Sofa Bus Features */}
      <section className="max-w-[90rem] mx-auto px-6 md:px-12 py-20 section-border">
        <h2 className="text-3xl md:text-5xl font-display font-bold text-slate-800 mb-6 text-center">
          Why Choose the VIP Sofa Bus?
        </h2>
        <p className="text-lg text-slate-500 max-w-2xl mx-auto leading-relaxed mb-16 text-center">
          The VIP Sofa Bus (2+1 configuration) offers the highest level of comfort for the Pokhara-Kathmandu route, perfect for night travel or relaxing daytime journeys.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            { icon: Armchair, title: '2+1 Sofa Seating', desc: 'Extra-wide, plush sofa seats with deep recline for sleeping.' },
            { icon: Snowflake, title: 'Climate Control', desc: 'Powerful AC and heating for comfort in any season.' },
            { icon: Wifi, title: 'Free WiFi', desc: 'Stay connected throughout the journey.' },
            { icon: Zap, title: 'Charging Ports', desc: 'USB ports at every seat to keep your devices charged.' },
            { icon: Shield, title: 'Premium Safety', desc: 'Air suspension and experienced drivers for a smooth ride.' },
            { icon: Coffee, title: 'Water & Snacks', desc: 'Complimentary bottled water and scheduled rest stops.' },
          ].map((feature, i) => (
            <div key={i} className="bg-white rounded-2xl p-8 border border-slate-100 shadow-sm">
              <div className="w-12 h-12 rounded-full bg-[#E31837]/10 flex items-center justify-center mb-6">
                <feature.icon className="w-6 h-6 text-[#E31837]" />
              </div>
              <h3 className="text-xl font-display font-bold text-slate-800 mb-3">{feature.title}</h3>
              <p className="text-slate-500 leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Difference between Sofa and Deluxe */}
      <section className="max-w-[90rem] mx-auto px-6 md:px-12 py-20">
        <h2 className="text-3xl md:text-5xl font-display font-bold text-slate-800 mb-12 text-center">
          VIP Sofa (2+1) vs Deluxe (2+2)
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl p-8 border-2 border-[#E31837] shadow-lg relative">
            <div className="absolute top-0 right-0 bg-[#E31837] text-white text-xs font-bold px-3 py-1 rounded-bl-lg rounded-tr-xl uppercase tracking-wider">
              Recommended
            </div>
            <h3 className="text-2xl font-display font-bold text-slate-800 mb-4">VIP Sofa Bus (2+1)</h3>
            <p className="text-xl text-[#E31837] font-bold mb-6">From Rs 1,800</p>
            <ul className="space-y-4">
              {[
                '3 seats per row (2 on one side, 1 solo seat)',
                'Extra wide, plush sofa-style cushions',
                'Deep recline angle for sleeping',
                'Maximum legroom',
                'Premium AC and suspension',
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-slate-600">
                  <Check className="w-5 h-5 text-[#E31837] flex-shrink-0 mt-0.5" /> {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-slate-50 rounded-2xl p-8 border border-slate-200">
            <h3 className="text-2xl font-display font-bold text-slate-800 mb-4">Deluxe Bus (2+2)</h3>
            <p className="text-xl text-slate-600 font-bold mb-6">From Rs 1,200</p>
            <ul className="space-y-4">
              {[
                '4 seats per row (2 on each side)',
                'Standard comfortable seating',
                'Standard recline',
                'Standard legroom',
                'AC and basic amenities',
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-slate-600">
                  <Check className="w-5 h-5 text-slate-400 flex-shrink-0 mt-0.5" /> {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-[90rem] mx-auto px-6 md:px-12 py-16 text-center">
        <h2 className="text-2xl font-display font-bold text-slate-800 mb-4">
          Reserve Your VIP Sofa Seat Today
        </h2>
        <p className="text-slate-500 mb-8">Select the "Sofa (2+1)" filter when searching for buses.</p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-[#E31837] text-white font-bold rounded-full hover:bg-[#C9132E] transition-colors"
        >
          Book VIP Sofa <ArrowRight className="w-4 h-4" />
        </Link>
      </section>
    </div>
  );
}
