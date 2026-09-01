import { Metadata } from 'next';
import { Mail, Phone, MapPin, MessageSquare } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Contact Us | Pokhara Travels',
  description: 'Get in touch with our support team.',
};

export default function ContactPage() {
  return (
    <main className="min-h-screen pt-28 pb-20">
      <div className="max-w-[90rem] mx-auto px-6 md:px-12">
        
        <div className="text-center max-w-2xl mx-auto mb-16">
          <p className="text-[0.6875rem] font-semibold text-brand-green uppercase tracking-[0.25em] mb-4">
            Get In Touch
          </p>
          <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-6">
            We're here to help
          </h1>
          <p className="text-lg text-white/50 leading-relaxed">
            Have a question about your booking, need help planning a group trip, or just want to say hello? Drop us a message.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 max-w-6xl mx-auto">
          
          {/* Contact Info */}
          <div className="lg:col-span-5 space-y-6">
            <div className="glass-static rounded-2xl p-8 flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-brand-green/10 flex items-center justify-center shrink-0">
                <Phone className="w-5 h-5 text-brand-green" />
              </div>
              <div>
                <h3 className="text-lg font-display font-semibold text-white mb-1">Call Us</h3>
                <p className="text-white/40 text-sm mb-2">Mon-Sun from 6am to 8pm.</p>
                <a href="tel:+9779800000000" className="text-brand-green hover:underline">+977 980-000-0000</a>
              </div>
            </div>

            <div className="glass-static rounded-2xl p-8 flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-brand-green/10 flex items-center justify-center shrink-0">
                <Mail className="w-5 h-5 text-brand-green" />
              </div>
              <div>
                <h3 className="text-lg font-display font-semibold text-white mb-1">Email Us</h3>
                <p className="text-white/40 text-sm mb-2">We typically reply within 24 hours.</p>
                <a href="mailto:support@pokharatravels.com" className="text-brand-green hover:underline">support@pokharatravels.com</a>
              </div>
            </div>

            <div className="glass-static rounded-2xl p-8 flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-brand-green/10 flex items-center justify-center shrink-0">
                <MapPin className="w-5 h-5 text-brand-green" />
              </div>
              <div>
                <h3 className="text-lg font-display font-semibold text-white mb-1">Main Office</h3>
                <p className="text-white/40 text-sm leading-relaxed">
                  Tourist Bus Park<br />
                  Lakeside, Pokhara<br />
                  Nepal
                </p>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-7">
            <div className="glass rounded-3xl p-8 md:p-12">
              <h2 className="text-2xl font-display font-bold text-white mb-8 flex items-center gap-3">
                <MessageSquare className="w-5 h-5 text-brand-green" />
                Send a Message
              </h2>
              
              <form className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[0.6875rem] font-semibold text-white/30 uppercase tracking-[0.15em] mb-3">
                      First Name
                    </label>
                    <input 
                      type="text" 
                      placeholder="Jane"
                      className="input-dark-simple" 
                    />
                  </div>
                  <div>
                    <label className="block text-[0.6875rem] font-semibold text-white/30 uppercase tracking-[0.15em] mb-3">
                      Last Name
                    </label>
                    <input 
                      type="text" 
                      placeholder="Doe"
                      className="input-dark-simple" 
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[0.6875rem] font-semibold text-white/30 uppercase tracking-[0.15em] mb-3">
                    Email Address
                  </label>
                  <input 
                    type="email" 
                    placeholder="jane@example.com"
                    className="input-dark-simple" 
                  />
                </div>

                <div>
                  <label className="block text-[0.6875rem] font-semibold text-white/30 uppercase tracking-[0.15em] mb-3">
                    Message
                  </label>
                  <textarea 
                    placeholder="How can we help you?"
                    className="input-dark-simple py-4"
                  ></textarea>
                </div>

                <button type="button" className="btn-accent w-full justify-center py-4 text-sm mt-4">
                  Send Message
                </button>
              </form>
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}
