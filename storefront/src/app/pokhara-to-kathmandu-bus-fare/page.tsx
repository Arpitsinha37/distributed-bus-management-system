import { Metadata } from 'next';
import Link from 'next/link';
import {
  Banknote, Bus, Armchair, Info, Check, ArrowRight
} from 'lucide-react';
import BookingFlow from '@/components/booking/BookingFlow';

export const metadata: Metadata = {
  title: 'Pokhara to Kathmandu Bus Fare & Ticket Price (2026/2027)',
  description:
    'Check latest Pokhara to Kathmandu bus fares. Prices range from Rs 1,000 (Microbus) to Rs 1,800+ (VIP Sofa). Compare options and book online with eSewa/Khalti.',
  alternates: { canonical: '/pokhara-to-kathmandu-bus-fare' },
  openGraph: {
    title: 'Pokhara to Kathmandu Bus Fare & Ticket Price',
    description: 'Check the latest Pokhara to Kathmandu bus fares for VIP Sofa, Deluxe, and Microbus. Compare prices and book online.',
    locale: 'en_NP',
  },
};

export default function BusFarePage() {
  return (
    <div className="w-full">
      {/* Hero */}
      <section
        className="hero-image flex flex-col justify-end px-6 md:px-12"
        style={{ backgroundImage: "url('/images/hero.jpg')" }} 
      >
        <div className="max-w-[90rem] mx-auto w-full pb-28 md:pb-32 pt-32 md:pt-40">
          <p className="text-[0.6875rem] font-bold text-[#E31837] uppercase tracking-[0.25em] mb-5">
            Ticket Prices &amp; Fares
          </p>
          <h1 className="text-[clamp(2.25rem,5vw,3.75rem)] font-display font-bold text-white leading-[1.1] tracking-tight mb-5 max-w-2xl">
            Compare fares, book instantly.
          </h1>
          <p className="text-base md:text-lg text-white/80 max-w-lg leading-relaxed">
            VIP Sofa · Super Deluxe · Microbus — all prices, one place.
          </p>
        </div>
      </section>

      {/* Booking bar */}
      <div className="relative z-20 max-w-[90rem] mx-auto px-6 md:px-12 -mt-12 md:-mt-14 mb-8">
        <BookingFlow />
      </div>

      {/* Fare Table */}
      <section className="max-w-[90rem] mx-auto px-6 md:px-12 py-20 section-border">
        <h2 className="text-3xl md:text-5xl font-display font-bold text-slate-800 mb-6 text-center">
          Current Bus Fares (2026/2027)
        </h2>
        <p className="text-lg text-slate-500 max-w-2xl mx-auto leading-relaxed mb-12 text-center">
          Bus ticket prices depend on the vehicle type, amenities, and seating configuration. Below are the standard estimated fares for the Pokhara to Kathmandu route.
        </p>

        <div className="max-w-4xl mx-auto overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="p-4 font-display font-bold text-slate-800">Bus Type</th>
                <th className="p-4 font-display font-bold text-slate-800">Seating Config</th>
                <th className="p-4 font-display font-bold text-slate-800">Amenities</th>
                <th className="p-4 font-display font-bold text-slate-800 text-right">Estimated Fare (NPR)</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                <td className="p-4 font-semibold text-slate-800 flex items-center gap-2">
                  <Armchair className="w-4 h-4 text-[#E31837]" /> VIP Sofa Bus
                </td>
                <td className="p-4 text-slate-600">2+1</td>
                <td className="p-4 text-slate-600 text-sm">AC, WiFi, Charging, Reclining Sofa, Water</td>
                <td className="p-4 text-right font-bold text-[#E31837]">Rs 1,800 - Rs 2,500</td>
              </tr>
              <tr className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                <td className="p-4 font-semibold text-slate-800 flex items-center gap-2">
                  <Bus className="w-4 h-4 text-[#E31837]" /> Super Deluxe
                </td>
                <td className="p-4 text-slate-600">2+2</td>
                <td className="p-4 text-slate-600 text-sm">AC, WiFi, Water, Comfortable Seats</td>
                <td className="p-4 text-right font-bold text-slate-700">Rs 1,200 - Rs 1,500</td>
              </tr>
              <tr className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                <td className="p-4 font-semibold text-slate-800 flex items-center gap-2">
                  <Bus className="w-4 h-4 text-[#E31837]" /> Standard Tourist Bus
                </td>
                <td className="p-4 text-slate-600">2+2</td>
                <td className="p-4 text-slate-600 text-sm">Fan/AC, Standard Seats</td>
                <td className="p-4 text-right font-bold text-slate-700">Rs 1,000 - Rs 1,200</td>
              </tr>
              <tr className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                <td className="p-4 font-semibold text-slate-800 flex items-center gap-2">
                  <Bus className="w-4 h-4 text-[#E31837]" /> HiAce / Microbus
                </td>
                <td className="p-4 text-slate-600">Standard</td>
                <td className="p-4 text-slate-600 text-sm">AC, Faster Journey (7 hours)</td>
                <td className="p-4 text-right font-bold text-slate-700">Rs 1,000 - Rs 1,200</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Info Notice */}
      <section className="max-w-4xl mx-auto px-6 mb-20">
        <div className="bg-amber-50 rounded-xl p-6 border border-amber-200 flex gap-4">
          <Info className="w-6 h-6 text-amber-500 flex-shrink-0" />
          <div>
            <h3 className="font-bold text-amber-800 mb-2">Notice Regarding Festival Fares</h3>
            <p className="text-amber-700 text-sm leading-relaxed">
              Please note that during major Nepalese festivals like Dashain and Tihar, bus fares may increase due to extremely high demand and limited availability. We recommend booking your tickets at least 1-2 weeks in advance during these periods.
            </p>
          </div>
        </div>
      </section>

      {/* Payment Methods */}
      <section className="max-w-[90rem] mx-auto px-6 md:px-12 py-20 bg-slate-50">
        <h2 className="text-3xl md:text-4xl font-display font-bold text-slate-800 mb-6 text-center">
          How to Pay for Your Ticket
        </h2>
        <p className="text-center text-slate-600 mb-10 max-w-2xl mx-auto">
          We offer convenient online payment methods so you can confirm your seat instantly without visiting the counter.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
          {['eSewa', 'Khalti', 'Fonepay (QR)', 'Credit/Debit Card'].map((method) => (
             <div key={method} className="bg-white p-4 rounded-lg border border-slate-200 text-center font-semibold text-slate-700">
               {method}
             </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-[90rem] mx-auto px-6 md:px-12 py-16 text-center">
        <h2 className="text-2xl font-display font-bold text-slate-800 mb-4">
          Ready to Check Exact Fares for Your Date?
        </h2>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-[#E31837] text-white font-bold rounded-full hover:bg-[#C9132E] transition-colors"
        >
          Search Buses &amp; View Prices <ArrowRight className="w-4 h-4" />
        </Link>
      </section>
    </div>
  );
}
