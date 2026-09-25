import Link from 'next/link';
import {
  Bus,
  MapPin,
  Shield,
  Wifi,
  Armchair,
  Zap,
  Clock,
  Star,
  ChevronRight,
  Users,
  Mountain,
  Snowflake,
  Moon,
  Coffee,
  Plug,
  Wind,
  Sofa,
  Heater,
  Bath,
  Headphones,
  Luggage,
  Navigation
} from 'lucide-react';
import BookingFlow from '@/components/booking/BookingFlow';
import RouteMap from '@/components/ui/RouteMap';

/* Star-burst SVG icon */
const StarBurst = () => (
  <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
    <path
      d="M8 0C8 0 7.32 2.42 7.32 4C7.32 5.58 8 8 8 8C8 8 5.58 7.32 4 7.32C2.42 7.32 0 8 0 8C0 8 .68 5.58 .68 4C.68 2.42 0 0 0 0C0 0 2.42 .68 4 .68C5.58 .68 8 0 8 0Z"
      fill="currentColor"
    />
  </svg>
);

export default function Home() {
  return (
    <div className="w-full">
      {/* ═══════════════════════════════════════════════════════
          HERO SECTION — Full viewport with stunning mountain image
      ═══════════════════════════════════════════════════════ */}
      <section
        className="hero-image flex flex-col items-center justify-center text-center px-6"
        style={{ backgroundImage: "url('/images/hero.jpg')" }}
      >
        <div className="pt-32 pb-16 md:pt-40 md:pb-16 max-w-5xl mx-auto w-full">
          <p className="text-[0.6875rem] font-semibold text-[#E31837] uppercase tracking-[0.25em] mb-6">
            Pokhara — Kathmandu &bull; Book Online
          </p>
          <h1 className="text-[clamp(2rem,5vw,4.5rem)] font-display font-bold text-white leading-[1.05] tracking-tight mb-6">
            Pokhara to Kathmandu Night Tourist Bus – Book Online
          </h1>
          <p className="text-lg md:text-xl text-white/90 max-w-xl mx-auto leading-relaxed mb-10">
            Book VIP Sofa seats on our night bus from Tourist Bus Park, Pokhara.
            Departs 7:00 PM, arrives Kathmandu ~5:30 AM. Choose your seat, pay with eSewa, Khalti, or card.
            From Rs 1,200.
          </p>
          
          {/* Booking search bar now embedded seamlessly in the hero */}
          <BookingFlow />
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          STATS BAR — Key route info at a glance
      ═══════════════════════════════════════════════════════ */}
      <section className="max-w-[90rem] mx-auto px-6 md:px-12 py-16 section-border">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { num: '7:00 PM', label: 'Daily Departure', icon: Moon },
            { num: '~200 km', label: 'Via Prithvi Highway', icon: Navigation },
            { num: 'VIP Sofa', label: '2+1 & 2+2 Configs', icon: Armchair },
            { num: 'Rs 1,200+', label: 'Starting Fare', icon: Bus },
          ].map((s, i) => (
            <div key={i} className="text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
                <s.icon className="w-5 h-5 text-[#E31837]/60" />
                <span className="text-3xl md:text-4xl font-display font-bold text-slate-800">
                  {s.num}
                </span>
              </div>
              <p className="text-[0.8125rem] text-slate-500">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          ROUTE SHOWCASE — Schedule & Boarding Points
      ═══════════════════════════════════════════════════════ */}
      <section className="max-w-[90rem] mx-auto px-6 md:px-12 py-20">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-12">
          <div className="md:col-span-3">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-5 h-5 rounded-full border border-slate-200 flex items-center justify-center">
                <Mountain className="w-2.5 h-2.5 text-slate-800/60" />
              </div>
              <span className="text-[0.8125rem] font-medium text-slate-500 tracking-wide">
                Night Service
              </span>
            </div>
          </div>
            <div className="md:col-span-9">
              <h2 className="text-3xl md:text-5xl font-display font-bold text-slate-800 mb-4">
                Pokhara to Kathmandu Night Bus Schedule &amp; Boarding Points
              </h2>
              <p className="text-lg text-slate-500 max-w-xl leading-relaxed">
                Depart from Tourist Bus Park (Rashtriya Bank Chowk) in the evening and arrive fresh in Kathmandu by 5:30 AM.
                The night journey via Prithvi Highway covers approximately 200 km with a rest stop along the way.
              </p>
            </div>
          </div>
  
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Card 1 — Departure */}
          <div className="img-card h-[400px] md:h-[500px] group cursor-pointer">
            <img
              src="/images/abc/1.jpeg"
              alt="VIP Sofa Bus interior with comfortable reclining seats for the Pokhara to Kathmandu night route"
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors duration-700" />
            <div className="absolute bottom-0 left-0 right-0 p-8 z-10">
              <p className="text-[0.6875rem] font-semibold text-[#E31837] uppercase tracking-[0.15em] mb-2">
                Departs 7:00 PM &bull; Arrive by 6:45 PM
              </p>
              <h3 className="text-2xl md:text-3xl font-display font-bold text-white mb-2">
                Pokhara → Kathmandu
              </h3>
              <p className="text-white/80 text-sm mb-4">
                Board at Tourist Bus Park (Rashtriya Bank Chowk), Pokhara
              </p>
            </div>
          </div>

          {/* Card 2 — Drop-off */}
          <div className="img-card h-[400px] md:h-[500px] group cursor-pointer">
            <img
              src="/images/abc/2.jpeg"
              alt="Night Tourist Bus on the Prithvi Highway between Pokhara and Kathmandu"
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors duration-700" />
            <div className="absolute bottom-0 left-0 right-0 p-8 z-10">
              <p className="text-[0.6875rem] font-semibold text-[#E31837] uppercase tracking-[0.15em] mb-2">
                Arrives ~5:30 AM
              </p>
              <h3 className="text-2xl md:text-3xl font-display font-bold text-white mb-2">
                Kathmandu Drop-off Points
              </h3>
              <p className="text-white/80 text-sm mb-4">
                Thankot · Kalanki · Swayambhu · Balaju · Sorakhutte
              </p>
            </div>
          </div>
        </div>

        <div className="h-[400px] md:h-[500px]">
           <RouteMap />
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          HOW IT WORKS — Booking Steps
      ═══════════════════════════════════════════════════════ */}
      <section className="max-w-[90rem] mx-auto px-6 md:px-12 py-20 section-border">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-14">
          <div className="md:col-span-3">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-5 h-5 rounded-full border border-slate-200 flex items-center justify-center">
                <Zap className="w-2.5 h-2.5 text-slate-800/60" />
              </div>
              <span className="text-[0.8125rem] font-medium text-slate-500 tracking-wide">
                How to Book
              </span>
            </div>
          </div>
          <div className="md:col-span-9">
            <h2 className="text-3xl md:text-5xl font-display font-bold text-slate-800">
              Book Your Night Bus in 4 Simple Steps
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            {
              step: '01',
              title: 'Search',
              desc: 'Select Pokhara to Kathmandu and your travel date.',
              icon: MapPin,
            },
            {
              step: '02',
              title: 'Select Seat',
              desc: 'Choose your preferred seat — VIP Sofa (2+1), Deluxe (2+2), or Microbus.',
              icon: Armchair,
            },
            {
              step: '03',
              title: 'Confirm & Pay',
              desc: 'Fill your details and pay via eSewa, Khalti, Fonepay, or card.',
              icon: Shield,
            },
            {
              step: '04',
              title: 'Travel',
              desc: 'Arrive by 6:45 PM at Tourist Bus Park. Sleep through the journey and wake up in Kathmandu!',
              icon: Moon,
            },
          ].map((item, i) => (
            <div
              key={i}
              className="glass rounded-2xl p-8 group hover:border-brand-green/20 transition-all duration-500"
            >
              <div className="w-10 h-10 rounded-xl bg-[#E31837]/10 border border-brand-green/20 flex items-center justify-center mb-6 group-hover:bg-[#E31837]/15 transition-colors">
                <item.icon className="w-4.5 h-4.5 text-[#E31837]" />
              </div>
              <div className="text-3xl font-display font-bold text-slate-600 mb-4 group-hover:text-[#E31837] transition-colors duration-500">
                {item.step}
              </div>
              <div className="text-lg font-display font-semibold text-white mb-2">
                {item.title}
              </div>
              <div className="text-[0.875rem] text-white/60 leading-relaxed">
                {item.desc}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          BUS AMENITIES — What's included on board
      ═══════════════════════════════════════════════════════ */}
      <section className="max-w-[90rem] mx-auto px-6 md:px-12 py-20">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-14">
          <div className="md:col-span-3">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-5 h-5 rounded-full border border-slate-200 flex items-center justify-center">
                <Bus className="w-2.5 h-2.5 text-slate-800/60" />
              </div>
              <span className="text-[0.8125rem] font-medium text-slate-500 tracking-wide">
                On-Board Amenities
              </span>
            </div>
          </div>
          <div className="md:col-span-9">
            <h2 className="text-3xl md:text-5xl font-display font-bold text-slate-800 mb-4">
              What&apos;s Included on Your Night Bus
            </h2>
            <p className="text-lg text-slate-500 max-w-xl leading-relaxed">
              Travel in comfort with premium amenities across all our bus types. Amenities vary by vehicle — details shown during seat selection.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {[
            { icon: Armchair, title: 'Sofa Reclining Seats', desc: 'Wide, padded seats that recline for sleeping' },
            { icon: Wind, title: 'Air Conditioning', desc: 'Climate-controlled cabin for comfortable travel' },
            { icon: Wifi, title: 'Free WiFi', desc: 'Stay connected throughout the journey' },
            { icon: Plug, title: 'Charging Ports', desc: 'USB & power outlets at every seat' },
            { icon: Bath, title: 'Onboard Toilet', desc: 'Available on select VIP buses' },
            { icon: Snowflake, title: 'Blankets', desc: 'Warm blankets for the mountain highway' },
            { icon: Coffee, title: 'Rest Stop', desc: 'Scheduled break for refreshments' },
            { icon: Luggage, title: 'Luggage Storage', desc: 'Secure compartment for your bags' },
          ].map((amenity, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl p-6 border border-slate-100 hover:border-[#E31837]/20 hover:shadow-lg hover:shadow-red-500/5 transition-all duration-300 group"
            >
              <div className="w-10 h-10 rounded-xl bg-[#E31837]/5 border border-[#E31837]/10 flex items-center justify-center mb-4 group-hover:bg-[#E31837]/10 transition-colors">
                <amenity.icon className="w-5 h-5 text-[#E31837]" />
              </div>
              <h3 className="text-sm font-display font-semibold text-slate-800 mb-1">
                {amenity.title}
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                {amenity.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          SCENIC PARALLAX BANNER
      ═══════════════════════════════════════════════════════ */}
      <section
        className="parallax-banner flex items-center justify-center text-center px-6"
        style={{ backgroundImage: "url('/images/abc/3.jpeg')" }}
      >
        <div className="max-w-3xl py-24">
          <p className="text-[0.6875rem] font-semibold text-[#E31837] uppercase tracking-[0.25em] mb-4">
            Save Your Daylight
          </p>
          <h2 className="text-3xl md:text-5xl font-display font-bold text-white leading-tight mb-6">
            Wake Up Fresh in Kathmandu
          </h2>
          <p className="text-white/90 text-lg leading-relaxed mb-8">
            Why lose a day to travel? Our night service via Prithvi Highway ensures you arrive by 5:30 AM,
            ready for your next adventure — whether it&apos;s a meeting, a flight, or exploring the Kathmandu Valley.
          </p>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          TESTIMONIALS
      ═══════════════════════════════════════════════════════ */}
      <section className="max-w-[90rem] mx-auto px-6 md:px-12 py-20">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-14">
          <div className="md:col-span-3">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-5 h-5 rounded-full border border-slate-200 flex items-center justify-center">
                <Users className="w-2.5 h-2.5 text-slate-800/60" />
              </div>
              <span className="text-[0.8125rem] font-medium text-slate-500 tracking-wide">
                Testimonials
              </span>
            </div>
          </div>
          <div className="md:col-span-9">
            <h2 className="text-3xl md:text-5xl font-display font-bold text-slate-800">
              What Travelers Say About Our Night Bus
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              name: 'Aarav Sharma',
              location: 'Kathmandu',
              text: 'The VIP solo seats are a game changer. I managed to get a full 8 hours of sleep and arrived fresh for my meeting.',
              rating: 5,
            },
            {
              name: 'Priya Patel',
              location: 'Pokhara',
              text: 'Very safe driving during the night. The heating worked perfectly, and the scheduled rest stop was well-lit and clean.',
              rating: 5,
            },
            {
              name: 'Marco Rossi',
              location: 'Italy (Tourist)',
              text: 'Much better than wasting daytime traveling. The sofa seats recline almost flat. Will definitely book the night bus again.',
              rating: 4,
            },
          ].map((t, i) => (
            <div key={i} className="testimonial-card">
              <div className="flex gap-1 mb-4">
                {Array.from({ length: 5 }).map((_, j) => (
                  <Star
                    key={j}
                    className={`w-4 h-4 ${
                      j < t.rating
                        ? 'text-brand-gold fill-brand-gold'
                        : 'text-slate-300'
                    }`}
                  />
                ))}
              </div>
              <p className="text-slate-800/60 text-[0.9375rem] leading-relaxed mb-6">
                &ldquo;{t.text}&rdquo;
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#E31837]/10 border border-brand-green/20 flex items-center justify-center">
                  <span className="text-[#E31837] font-display font-bold text-sm">
                    {t.name.charAt(0)}
                  </span>
                </div>
                <div>
                  <p className="text-slate-800 font-semibold text-sm">{t.name}</p>
                  <p className="text-slate-400 text-xs">{t.location}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
