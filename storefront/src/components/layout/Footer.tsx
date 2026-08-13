import Link from 'next/link';
import { Bus, Phone, Mail, MapPin, Facebook, Instagram, Twitter } from 'lucide-react';
import { api } from '@/lib/api';

async function getSiteSettings() {
  try {
    const res = await api.get('/cms/settings', {
      headers: { 'X-Site-Id': process.env.NEXT_PUBLIC_SITE_ID }
    });
    return res.data;
  } catch (error) {
    return null;
  }
}

export default async function Footer() {
  const settings = await getSiteSettings();
  const contact = settings?.contactInfo || {};

  return (
    <footer className="bg-gray-900 text-gray-300 py-12 px-6">
      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="md:col-span-1">
          <Link href="/" className="flex items-center gap-2 text-white font-display font-bold text-2xl tracking-tight mb-4">
            <Bus className="w-6 h-6 text-red-500" />
            <span>{contact.name || 'SpeedX'}</span>
          </Link>
          <p className="text-sm text-gray-400 mb-6">
            {settings?.aboutUsText ? (settings.aboutUsText.substring(0, 100) + '...') : 'The best bus booking platform.'}
          </p>
          <div className="flex gap-4">
            {contact.facebookUrl && <a href={contact.facebookUrl} className="text-gray-400 hover:text-white"><Facebook className="w-5 h-5" /></a>}
            {contact.instagramUrl && <a href={contact.instagramUrl} className="text-gray-400 hover:text-white"><Instagram className="w-5 h-5" /></a>}
            {contact.twitterUrl && <a href={contact.twitterUrl} className="text-gray-400 hover:text-white"><Twitter className="w-5 h-5" /></a>}
          </div>
        </div>

        <div>
          <h3 className="text-white font-bold mb-4">Quick Links</h3>
          <ul className="space-y-2 text-sm">
            <li><Link href="/" className="hover:text-red-400">Home</Link></li>
            <li><Link href="/about" className="hover:text-red-400">About Us</Link></li>
            <li><Link href="/contact" className="hover:text-red-400">Contact</Link></li>
            <li><Link href="/track" className="hover:text-red-400">Track Booking</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="text-white font-bold mb-4">Legal</h3>
          <ul className="space-y-2 text-sm">
            <li><Link href="/terms" className="hover:text-red-400">Terms & Conditions</Link></li>
            <li><Link href="/privacy" className="hover:text-red-400">Privacy Policy</Link></li>
            <li><Link href="/cancellation" className="hover:text-red-400">Cancellation Policy</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="text-white font-bold mb-4">Contact Us</h3>
          <ul className="space-y-3 text-sm">
            {contact.phone && (
              <li className="flex items-start gap-2">
                <Phone className="w-4 h-4 text-red-500 mt-0.5" />
                <span>{contact.phone}</span>
              </li>
            )}
            {contact.email && (
              <li className="flex items-start gap-2">
                <Mail className="w-4 h-4 text-red-500 mt-0.5" />
                <span>{contact.email}</span>
              </li>
            )}
            {contact.address && (
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-red-500 mt-0.5" />
                <span>{contact.address}</span>
              </li>
            )}
          </ul>
        </div>
      </div>
      
      <div className="max-w-4xl mx-auto border-t border-gray-800 mt-10 pt-6 text-center text-xs text-gray-500">
        &copy; {new Date().getFullYear()} {contact.name || 'SpeedX'}. All rights reserved.
      </div>
    </footer>
  );
}
