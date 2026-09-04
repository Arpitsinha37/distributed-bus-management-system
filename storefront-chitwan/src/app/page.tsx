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
  TreePine,
  Snowflake,
  Sun,
  Coffee
} from 'lucide-react';
import BookingFlow from '@/components/booking/BookingFlow';

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
          HERO SECTION — Full viewport with looping background video
      ═══════════════════════════════════════════════════════ */}
      <section className="hero-video flex flex-col items-center justify-center text-center px-6">
        <video
          autoPlay
          muted
          loop
          playsInline
          poster="/images/hero-poster.jpg"
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source
            src="https://res.cloudinary.com/dealfp76k/video/upload/w_1280,q_auto:low/Bus_driving_on_mountain_highway_delpmaspu__hajeim.mp4"
            type="video/mp4"
          />
        </video>
        <div className="pt-32 pb-16 md:pt-40 md:pb-16 max-w-5xl mx-auto w-full relative z-[3]">
          <p className="text-[0.6875rem] font-semibold text-[#E31837] uppercase tracking-[0.25em] mb-6">
            Chitwan — Kathmandu
          </p>
          <h1 className="text-[clamp(2.5rem,6vw,5.5rem)] font-display font-bold text-white leading-[1.05] tracking-tight mb-6">
            VIP Sofa Bus
          </h1>
          <p className="text-lg md:text-xl text-white/90 max-w-xl mx-auto leading-relaxed mb-10">
            Travel in luxury from the jungle to the capital. Book VIP Sofa seats and enjoy a comfortable 5-hour scenic highway ride.
          </p>
          
          {/* Booking search bar now embedded seamlessly in the hero */}
          <BookingFlow />
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          STATS BAR
      ═══════════════════════════════════════════════════════ */}
      <section className="max-w-[90rem] mx-auto px-6 md:px-12 py-16 section-border">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { num: '7:00 AM', label: 'Morning Departure', icon: Sun },
            { num: '5–6h', label: 'Avg Travel Time', icon: Clock },
            { num: 'VIP', label: 'Sofa Configuration', icon: Armchair },
            { num: 'Rs. 1500+', label: 'Starting Fare', icon: Bus },
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
          ROUTE SHOWCASE — Image cards
      ═══════════════════════════════════════════════════════ */}
      <section className="max-w-[90rem] mx-auto px-6 md:px-12 py-20">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-12">
          <div className="md:col-span-3">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-5 h-5 rounded-full border border-slate-200 flex items-center justify-center">
                <TreePine className="w-2.5 h-2.5 text-slate-800/60" />
              </div>
              <span className="text-[0.8125rem] font-medium text-slate-500 tracking-wide">
                Day Service
              </span>
            </div>
          </div>
          <div className="md:col-span-9">
            <h2 className="text-3xl md:grid-cols-5xl font-display font-bold text-slate-800 mb-4">
              From jungle to the capital
            </h2>
            <p className="text-lg text-slate-500 max-w-xl leading-relaxed">
              Enjoy the scenic Prithvi Highway through the hills. Depart from Chitwan and arrive at Kathmandu in comfort.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card 1 */}
          <div className="img-card h-[400px] md:h-[500px] group cursor-pointer">
            <img
              src="/images/vip-sofa-bus.jpg"
              alt="VIP Sofa Bus interior with comfortable seats"
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors duration-700" />
            <div className="absolute bottom-0 left-0 right-0 p-8 z-10">
              <p className="text-[0.6875rem] font-semibold text-[#E31837] uppercase tracking-[0.15em] mb-2">
                Departs 7:00 AM
              </p>
              <h3 className="text-2xl md:text-3xl font-display font-bold text-slate-800 mb-2">
                Chitwan → Kathmandu
              </h3>
              <p className="text-slate-500 text-sm mb-4">
                Pickup from Sauraha, Bharatpur (Tourist Bus Park)
              </p>
            </div>
          </div>

          {/* Card 2 */}
          <div className="img-card h-[400px] md:h-[500px] group cursor-pointer">
            <img
              src="/images/Sofa-Bus-Nepal-2.jpg"
              alt="VIP Sofa Bus exterior"
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors duration-700" />
            <div className="absolute bottom-0 left-0 right-0 p-8 z-10">
              <p className="text-[0.6875rem] font-semibold text-[#E31837] uppercase tracking-[0.15em] mb-2">
                Arrives 1:00 PM
              </p>
              <h3 className="text-2xl md:text-3xl font-display font-bold text-slate-800 mb-2">
                Drop-off Locations
              </h3>
              <p className="text-slate-500 text-sm mb-4">
                Kalanki, Sorakhutte, Koteshwor, New Bus Park
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          HOW IT WORKS
      ═══════════════════════════════════════════════════════ */}
      <section className="max-w-[90rem] mx-auto px-6 md:px-12 py-20 section-border">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-14">
          <div className="md:col-span-3">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-5 h-5 rounded-full border border-slate-200 flex items-center justify-center">
                <Zap className="w-2.5 h-2.5 text-slate-800/60" />
              </div>
              <span className="text-[0.8125rem] font-medium text-slate-500 tracking-wide">
                How It Works
              </span>
            </div>
          </div>
          <div className="md:col-span-9">
            <h2 className="text-3xl md:text-5xl font-display font-bold text-slate-800">
              Book in 4 simple steps
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            {
              step: '01',
              title: 'Search',
              desc: 'Select Chitwan to Kathmandu.',
              icon: MapPin,
            },
            {
              step: '02',
              title: 'Select Seat',
              desc: 'Choose your VIP Sofa seat (2/1 or 2/2 config).',
              icon: Armchair,
            },
            {
              step: '03',
              title: 'Confirm & Pay',
              desc: 'Fill your details and make secure payment.',
              icon: Shield,
            },
            {
              step: '04',
              title: 'Travel',
              desc: 'Board at 6:30 AM. Enjoy the scenic ride!',
              icon: Sun,
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
          FEATURES — Premium amenities
      ═══════════════════════════════════════════════════════ */}
      <section className="max-w-[90rem] mx-auto px-6 md:px-12 py-20">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-14">
          <div className="md:col-span-3">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-5 h-5 rounded-full border border-slate-200 flex items-center justify-center">
                <Star className="w-2.5 h-2.5 text-slate-800/60" />
              </div>
              <span className="text-[0.8125rem] font-medium text-slate-500 tracking-wide">
                VIP Amenities
              </span>
            </div>
          </div>
          <div className="md:col-span-9">
            <h2 className="text-3xl md:text-5xl font-display font-bold text-slate-800 mb-4">
              Travel in absolute comfort
            </h2>
            <p className="text-lg text-slate-500 max-w-xl leading-relaxed">
              Our VIP sofa buses are engineered for premium highway comfort with top-tier amenities.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[
            { icon: Armchair, title: 'VIP Sofa Seats', desc: 'Choose between 2/1 solo luxury seats or 2/2 premium double seats with deep recline.' },
            { icon: Snowflake, title: 'A/C Throughout', desc: 'Fully air-conditioned cabins for a cool, comfortable ride through the Terai heat.' },
            { icon: Zap, title: 'USB Ports', desc: 'Keep your devices charged with individual USB charging ports at every seat.' },
            { icon: Wifi, title: 'Free Wi-Fi', desc: 'Stay connected throughout your journey on the Prithvi Highway.' },
            { icon: Coffee, title: 'Scheduled Stops', desc: 'Safely planned restroom and refreshment breaks at Mugling and Malekhu.' },
            { icon: Clock, title: 'Reporting Time', desc: 'Arrive by 6:30 AM for a smooth boarding and luggage loading process.' },
          ].map((f, i) => (
            <div key={i} className="feature-card">
              <div className="icon-wrap">
                <f.icon className="w-5 h-5 text-[#E31837]" />
              </div>
              <h3 className="text-slate-800 font-display font-semibold text-lg mb-2">
                {f.title}
              </h3>
              <p className="text-slate-500 text-[0.875rem] leading-relaxed">
                {f.desc}
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
        style={{ backgroundImage: "url('/images/about-mountain.jpg')" }}
      >
        <div className="max-w-3xl py-24">
          <p className="text-[0.6875rem] font-semibold text-[#E31837] uppercase tracking-[0.25em] mb-4">
            Scenic Highway
          </p>
          <h2 className="text-3xl md:text-5xl font-display font-bold text-white leading-tight mb-6">
            From jungle to city in comfort
          </h2>
          <p className="text-white/90 text-lg leading-relaxed mb-8">
            Experience the breathtaking Prithvi Highway — winding through river valleys, past Mugling junction, and through the hills to Kathmandu.
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
              What travelers say
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              name: 'Suman Thapa',
              location: 'Chitwan',
              text: 'Best bus service from Chitwan to Kathmandu. The VIP seats are incredibly comfortable and the A/C works perfectly even in the Terai summer.',
              rating: 5,
            },
            {
              name: 'Emily Watson',
              location: 'UK (Tourist)',
              text: 'After our jungle safari in Chitwan, this was the perfect way to get to Kathmandu. Smooth ride, scenic views, and very professional driver.',
              rating: 5,
            },
            {
              name: 'Rajesh Kumar',
              location: 'Bharatpur',
              text: 'I travel this route weekly for business. The online booking system is seamless, and the bus is always on time. Highly recommended.',
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
