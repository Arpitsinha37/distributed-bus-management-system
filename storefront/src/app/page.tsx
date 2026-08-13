import { Bus, MapPin, Calendar, Star } from 'lucide-react';
import Link from 'next/link';
import { api } from '@/lib/api';

async function getHomeData() {
  try {
    const headers = { 'X-Site-Id': process.env.NEXT_PUBLIC_SITE_ID };
    const [slidersRes, testimonialsRes] = await Promise.all([
      api.get('/cms/sliders', { headers }),
      api.get('/cms/testimonials', { headers }),
    ]);
    return {
      sliders: slidersRes.data || [],
      testimonials: testimonialsRes.data || []
    };
  } catch (error) {
    return { sliders: [], testimonials: [] };
  }
}

export default async function Home() {
  const { sliders, testimonials } = await getHomeData();
  const heroImage = sliders.length > 0 
    ? sliders[0].imageUrl 
    : "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?q=80&w=2069&auto=format&fit=crop";
    
  const heroTitle = sliders.length > 0 ? sliders[0].title : "Your Journey,\nPerfectly Planned.";
  const heroSubtitle = sliders.length > 0 ? sliders[0].subtitle : "Book premium buses instantly across the country with instant confirmation and live seat selection.";

  return (
    <div className="flex flex-col gap-0 w-full pb-10">
      {/* Hero Section */}
      <section className="relative bg-gray-900 text-white overflow-hidden pb-32 -mx-6 md:-mx-12 lg:-mx-40 px-6 md:px-12 lg:px-40 rounded-b-3xl">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-30 mix-blend-overlay"
          style={{ backgroundImage: `url('${heroImage}')` }}
        ></div>
        <div className="relative max-w-5xl mx-auto pt-24 pb-12">
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-6 whitespace-pre-line leading-tight">
            {heroTitle}
          </h1>
          <p className="text-xl md:text-2xl font-medium max-w-2xl opacity-90">
            {heroSubtitle}
          </p>
        </div>
      </section>

      {/* Search Widget */}
      <section className="max-w-5xl w-full mx-auto -mt-20 relative z-10 px-4">
        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 border border-gray-100">
          <form action="/search" method="GET" className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            
            {/* Origin */}
            <div className="flex flex-col space-y-2">
              <label htmlFor="origin" className="text-xs font-bold text-gray-500 uppercase tracking-wider">From</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input 
                  type="text" 
                  name="origin" 
                  id="origin" 
                  required
                  placeholder="e.g. Kathmandu" 
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white transition-colors text-gray-900 font-medium placeholder-gray-400"
                />
              </div>
            </div>

            {/* Destination */}
            <div className="flex flex-col space-y-2">
              <label htmlFor="destination" className="text-xs font-bold text-gray-500 uppercase tracking-wider">To</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input 
                  type="text" 
                  name="destination" 
                  id="destination" 
                  required
                  placeholder="e.g. Pokhara" 
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white transition-colors text-gray-900 font-medium placeholder-gray-400"
                />
              </div>
            </div>

            {/* Date */}
            <div className="flex flex-col space-y-2">
              <label htmlFor="date" className="text-xs font-bold text-gray-500 uppercase tracking-wider">Date</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input 
                  type="date" 
                  name="date" 
                  id="date" 
                  required
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white transition-colors text-gray-900 font-medium"
                />
              </div>
            </div>

            {/* Submit */}
            <button 
              type="submit" 
              className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-xl shadow-lg shadow-red-600/20 transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <Bus className="w-5 h-5" />
              Search Buses
            </button>
          </form>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-5xl mx-auto w-full py-24">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="text-center group">
            <div className="w-20 h-20 mx-auto bg-red-50 text-red-600 rounded-3xl flex items-center justify-center mb-6 group-hover:-translate-y-2 transition-transform duration-300">
              <Bus className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-bold mb-3 text-gray-900">Premium Fleet</h3>
            <p className="text-gray-500 leading-relaxed">Travel in luxury with our modern, well-maintained fleet equipped with VIP sofa seats and modern amenities.</p>
          </div>
          <div className="text-center group">
            <div className="w-20 h-20 mx-auto bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center mb-6 group-hover:-translate-y-2 transition-transform duration-300">
              <MapPin className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-bold mb-3 text-gray-900">Extensive Network</h3>
            <p className="text-gray-500 leading-relaxed">Connecting major cities with convenient boarding points and reliable drop-offs.</p>
          </div>
          <div className="text-center group">
            <div className="w-20 h-20 mx-auto bg-green-50 text-green-600 rounded-3xl flex items-center justify-center mb-6 group-hover:-translate-y-2 transition-transform duration-300">
              <Calendar className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-bold mb-3 text-gray-900">Instant Booking</h3>
            <p className="text-gray-500 leading-relaxed">Secure your seats instantly with live availability mapping and lightning-fast checkout.</p>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      {testimonials.length > 0 && (
        <section className="max-w-5xl mx-auto w-full py-16 border-t border-gray-100">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">What Our Travelers Say</h2>
            <p className="text-gray-500">Trusted by thousands of passengers everyday.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.slice(0, 3).map((t: any) => (
              <div key={t.id} className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex text-yellow-400 mb-4">
                  {[...Array(t.rating)].map((_, i) => <Star key={i} className="w-5 h-5 fill-current" />)}
                </div>
                <p className="text-gray-600 italic mb-6">"{t.content}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center font-bold text-gray-500 overflow-hidden">
                    {t.avatarUrl ? <img src={t.avatarUrl} alt={t.name} className="w-full h-full object-cover" /> : t.name[0]}
                  </div>
                  <div>
                    <div className="font-bold text-gray-900">{t.name}</div>
                    <div className="text-sm text-gray-500">{t.role || 'Passenger'}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
