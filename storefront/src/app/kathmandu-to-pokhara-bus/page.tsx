import { Metadata } from 'next';
import Link from 'next/link';
import {
  Bus, MapPin, Moon, Armchair, Clock, Shield, Wifi, Plug,
  Wind, Snowflake, Coffee, Luggage, Bath, Navigation, ArrowRight
} from 'lucide-react';
import BookingFlow from '@/components/booking/BookingFlow';
import RouteMap from '@/components/ui/RouteMap';

export const metadata: Metadata = {
  title: 'Kathmandu to Pokhara Bus Ticket – Night & Day Tourist Bus',
  description:
    'Book Kathmandu to Pokhara bus tickets online. VIP sofa, deluxe, and microbus options. Departs from Sorakhutte/Kalanki, arrives Tourist Bus Park Pokhara. From Rs 1,200.',
  alternates: { canonical: '/kathmandu-to-pokhara-bus' },
  openGraph: {
    title: 'Kathmandu to Pokhara Bus Ticket – Night & Day Tourist Bus',
    description: 'Book Kathmandu to Pokhara bus tickets online. VIP sofa night bus and day tourist bus. Real-time seat selection.',
    locale: 'en_NP',
  },
};

export default function KathmanduToPokharaPage() {
  return (
    <div className="w-full">
      {/* Hero */}
      <section
        className="hero-image flex flex-col items-center justify-center text-center px-6"
        style={{ backgroundImage: "url('/images/hero.jpg')" }}
      >
        <div className="pt-32 pb-16 md:pt-40 md:pb-16 max-w-5xl mx-auto w-full">
          <p className="text-[0.6875rem] font-semibold text-[#E31837] uppercase tracking-[0.25em] mb-6">
            Kathmandu — Pokhara &bull; Book Online
          </p>
          <h1 className="text-[clamp(2rem,5vw,4.5rem)] font-display font-bold text-white leading-[1.05] tracking-tight mb-6">
            Kathmandu to Pokhara Bus Ticket – Book Online
          </h1>
          <p className="text-lg md:text-xl text-white/90 max-w-xl mx-auto leading-relaxed mb-10">
            Travel from Kathmandu to Pokhara by night bus or day tourist bus. VIP Sofa, Deluxe, and Microbus options available.
            Board from Sorakhutte, Balaju, Kalanki, or Thankot. From Rs 1,200.
          </p>
          <BookingFlow />
        </div>
      </section>

      {/* Stats */}
      <section className="max-w-[90rem] mx-auto px-6 md:px-12 py-16 section-border">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { num: '7:00 PM', label: 'Night Bus Departure', icon: Moon },
            { num: '~200 km', label: 'Via Prithvi Highway', icon: Navigation },
            { num: 'Multiple', label: 'Bus Types Available', icon: Bus },
            { num: 'Rs 1,200+', label: 'Starting Fare', icon: Armchair },
          ].map((s, i) => (
            <div key={i} className="text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
                <s.icon className="w-5 h-5 text-[#E31837]/60" />
                <span className="text-3xl md:text-4xl font-display font-bold text-slate-800">{s.num}</span>
              </div>
              <p className="text-[0.8125rem] text-slate-500">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Boarding & Drop-off */}
      <section className="max-w-[90rem] mx-auto px-6 md:px-12 py-20">
        <h2 className="text-3xl md:text-5xl font-display font-bold text-slate-800 mb-6">
          Kathmandu Boarding Points &amp; Pokhara Drop-off
        </h2>
        <p className="text-lg text-slate-500 max-w-2xl leading-relaxed mb-12">
          The bus picks up passengers at multiple locations in Kathmandu before heading west on the Prithvi Highway to Pokhara.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white rounded-2xl p-8 border border-slate-100">
            <h3 className="text-xl font-display font-bold text-slate-800 mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-[#E31837]" /> Kathmandu Boarding Points
            </h3>
            <ul className="space-y-3">
              {['Sorakhutte', 'Balaju', 'Swayambhu', 'Kalanki', 'Thankot'].map((point) => (
                <li key={point} className="flex items-center gap-3 text-slate-600">
                  <div className="w-2 h-2 rounded-full bg-[#E31837]/40" />
                  {point}
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-white rounded-2xl p-8 border border-slate-100">
            <h3 className="text-xl font-display font-bold text-slate-800 mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-green-600" /> Pokhara Drop-off
            </h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-3 text-slate-600">
                <div className="w-2 h-2 rounded-full bg-green-400" />
                Tourist Bus Park (Rashtriya Bank Chowk)
              </li>
            </ul>
            <p className="text-sm text-slate-400 mt-4">Arrives approximately 5:30 AM (night bus) or 3:00 PM (day bus)</p>
          </div>
        </div>

        <div className="h-[400px] md:h-[500px] mt-8">
           <RouteMap />
        </div>
      </section>

      {/* Bus Types */}
      <section className="max-w-[90rem] mx-auto px-6 md:px-12 py-20 section-border">
        <h2 className="text-3xl md:text-5xl font-display font-bold text-slate-800 mb-6">
          Kathmandu to Pokhara Bus Types &amp; Fares
        </h2>
        <p className="text-lg text-slate-500 max-w-2xl leading-relaxed mb-12">
          Choose the bus type that suits your budget and comfort level. All buses travel the same Prithvi Highway route.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { type: 'VIP Sofa (2+1)', fare: 'Rs 1,800+', features: ['Wide reclining seats', 'AC', 'WiFi', 'Charging ports', 'Blankets'] },
            { type: 'Deluxe (2+2)', fare: 'Rs 1,200+', features: ['Comfortable seats', 'AC', 'Rest stop', 'Luggage storage'] },
            { type: 'Microbus', fare: 'Rs 1,000+', features: ['Faster journey', 'Smaller vehicle', 'Multiple departures'] },
          ].map((bus, i) => (
            <div key={i} className="bg-white rounded-2xl p-8 border border-slate-100 hover:border-[#E31837]/20 hover:shadow-lg transition-all duration-300">
              <h3 className="text-xl font-display font-bold text-slate-800 mb-2">{bus.type}</h3>
              <p className="text-2xl font-display font-bold text-[#E31837] mb-4">{bus.fare}</p>
              <ul className="space-y-2">
                {bus.features.map((f, j) => (
                  <li key={j} className="flex items-center gap-2 text-sm text-slate-600">
                    <Shield className="w-3.5 h-3.5 text-green-500" /> {f}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-[90rem] mx-auto px-6 md:px-12 py-20">
        <h2 className="text-3xl md:text-5xl font-display font-bold text-slate-800 mb-12">
          Kathmandu to Pokhara Bus – Frequently Asked Questions
        </h2>
        <div className="max-w-3xl space-y-6">
          {[
            {
              q: 'Where do I board the Kathmandu to Pokhara bus?',
              a: 'Night buses pick up passengers at Sorakhutte, Balaju, Swayambhu, Kalanki, and Thankot in Kathmandu. Day tourist buses depart from Sorakhutte Bus Park.',
            },
            {
              q: 'How long does the Kathmandu to Pokhara bus journey take?',
              a: 'Day buses take approximately 7–8 hours via Prithvi Highway. Night buses take around 10 hours as they travel at reduced speed for safety, with a rest stop.',
            },
            {
              q: 'What is the fare for the Kathmandu to Pokhara bus?',
              a: 'Fares start from Rs 1,000 for microbus, Rs 1,200 for deluxe bus, and Rs 1,800 for VIP sofa bus. Prices may vary during festivals like Dashain and Tihar.',
            },
            {
              q: 'Can I book the Kathmandu to Pokhara bus online?',
              a: 'Yes! Use our online booking system to select your date, choose your seat, and pay with eSewa, Khalti, Fonepay, or international credit/debit cards.',
            },
          ].map((faq, i) => (
            <div key={i} className="bg-white rounded-xl p-6 border border-slate-100">
              <h3 className="font-display font-semibold text-slate-800 mb-2">{faq.q}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-[90rem] mx-auto px-6 md:px-12 py-16 text-center">
        <h2 className="text-2xl font-display font-bold text-slate-800 mb-4">
          Ready to Book Your Kathmandu to Pokhara Bus?
        </h2>
        <p className="text-slate-500 mb-8">Select your date above or browse available schedules.</p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-[#E31837] text-white font-bold rounded-full hover:bg-[#C9132E] transition-colors"
        >
          Search Buses <ArrowRight className="w-4 h-4" />
        </Link>
      </section>
    </div>
  );
}
