import Link from 'next/link';
import { Bus, Menu } from 'lucide-react';
import { api } from '@/lib/api';

async function getSiteSettings() {
  try {
    const res = await api.get('/cms/settings', {
      headers: { 'X-Site-Id': process.env.NEXT_PUBLIC_SITE_ID }
    });
    return res.data;
  } catch (error) {
    console.error("Failed to fetch settings", error);
    return null;
  }
}

export default async function Header() {
  const settings = await getSiteSettings();
  
  return (
    <nav className="bg-white border-b border-neutral-100 py-4 px-6 sticky top-0 z-50">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-navy font-display font-bold text-2xl tracking-tight">
          <Bus className="w-8 h-8 text-red-600" />
          <span>{settings?.contactInfo?.name || 'SpeedX'}</span>
        </Link>
        
        <div className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-600">
          <Link href="/" className="hover:text-red-600 transition-colors">Home</Link>
          <Link href="/track" className="hover:text-red-600 transition-colors">Track Booking</Link>
          <Link href="/about" className="hover:text-red-600 transition-colors">About Us</Link>
          <Link href="/contact" className="hover:text-red-600 transition-colors">Contact</Link>
        </div>

        <div className="md:hidden">
          <button className="p-2 text-gray-600 hover:text-red-600">
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </div>
    </nav>
  );
}
