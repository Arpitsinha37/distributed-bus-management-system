import { Metadata } from 'next';
import { Shield, Mountain, Heart, Star, Users, MapPin } from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'About Us | Pokhara Travels',
  description: 'Learn about our premium bus travel experience between Pokhara and Kathmandu.',
};

export default function AboutPage() {
  return (
    <main className="min-h-screen pt-28 pb-20">
      <div className="max-w-[90rem] mx-auto px-6 md:px-12">
        {/* Header Section */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-20 items-center">
          <div className="md:col-span-6">
            <p className="text-[0.6875rem] font-semibold text-brand-green uppercase tracking-[0.25em] mb-4">
              Our Story
            </p>
            <h1 className="text-4xl md:text-6xl font-display font-bold text-white mb-6 leading-tight">
              Elevating the journey across Nepal
            </h1>
            <p className="text-lg text-white/60 leading-relaxed mb-8 max-w-lg">
              We started Pokhara Travels with a simple belief: the journey between Nepal's two greatest cities should be as beautiful and comfortable as the destinations themselves.
            </p>
            <div className="flex gap-4">
              <Link href="/#search-section" className="btn-accent">
                Book a Ride
              </Link>
            </div>
          </div>
          
          <div className="md:col-span-6 relative h-[500px]">
            <img 
              src="/images/about-mountain.jpg" 
              alt="Mountain Road" 
              className="absolute inset-0 w-full h-full object-cover rounded-2xl"
            />
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-brand-dark/80 to-transparent"></div>
          </div>
        </div>

        {/* Values Section */}
        <div className="mb-24">
          <h2 className="text-3xl font-display font-bold text-white mb-10 text-center">Our Core Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: Shield,
                title: 'Uncompromising Safety',
                desc: 'Every vehicle undergoes rigorous daily checks, and our drivers are the most experienced on the Himalayan routes.',
              },
              {
                icon: Heart,
                title: 'Premium Comfort',
                desc: 'We believe you should arrive feeling refreshed. That means recliner seats, AC, and a smooth ride.',
              },
              {
                icon: Mountain,
                title: 'Respect the Route',
                desc: 'We honor the breathtaking environment we travel through, maintaining modern, lower-emission vehicles.',
              },
            ].map((v, i) => (
              <div key={i} className="glass rounded-2xl p-8 text-center flex flex-col items-center group hover:border-brand-green/20 transition-all duration-500">
                <div className="w-14 h-14 rounded-full bg-brand-green/10 border border-brand-green/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <v.icon className="w-6 h-6 text-brand-green" />
                </div>
                <h3 className="text-xl font-display font-bold text-white mb-4">{v.title}</h3>
                <p className="text-white/50 leading-relaxed text-sm">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Stats Section */}
        <div className="glass-static rounded-3xl p-12 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-brand-green/5 blur-[100px] rounded-full"></div>
          <div className="relative z-10 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
             <div>
               <div className="text-4xl md:text-5xl font-display font-bold text-white mb-2">5+</div>
               <div className="text-sm text-brand-green uppercase tracking-widest font-semibold">Years Active</div>
             </div>
             <div>
               <div className="text-4xl md:text-5xl font-display font-bold text-white mb-2">15</div>
               <div className="text-sm text-brand-green uppercase tracking-widest font-semibold">Luxury Buses</div>
             </div>
             <div>
               <div className="text-4xl md:text-5xl font-display font-bold text-white mb-2">50k+</div>
               <div className="text-sm text-brand-green uppercase tracking-widest font-semibold">Happy Travelers</div>
             </div>
             <div>
               <div className="text-4xl md:text-5xl font-display font-bold text-white mb-2">4.9</div>
               <div className="text-sm text-brand-green uppercase tracking-widest font-semibold">Average Rating</div>
             </div>
          </div>
        </div>

      </div>
    </main>
  );
}
