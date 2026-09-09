import React, { useState, useEffect } from 'react';
import { Search, MessageCircle, Phone } from 'lucide-react';
import SEOHead from '../components/nrt/SEOHead';
import ScrollFAQAccordion from '../components/nrt/ui/scroll-faqaccordion';
import { BackgroundPaths } from '../components/nrt/ui/background-paths';
import api from '../lib/api';

const HARDCODED_FAQS = [
    { id: 1, category: 'Booking', question: 'How do I book a bus ticket with New Road Travels?', answer: 'You can book tickets through our website by selecting your route, date, and preferred bus. You can also contact us via WhatsApp at +977-9856068470 or visit our counter at Tourist Bus Park, Sorhakhutte, Kathmandu.' },
    { id: 2, category: 'Booking', question: 'Can I cancel or modify my booking?', answer: 'Yes, you can cancel or modify your booking up to 24 hours before departure. Cancellations made within 24 hours of departure may incur a cancellation fee.' },
    { id: 3, category: 'Services', question: 'What types of buses do you operate?', answer: 'We operate Luxury Sofa Buses, Super Deluxe Buses, Tourist Buses, and VIP Coaches with AC, WiFi, entertainment systems, and comfortable seating.' },
    { id: 4, category: 'General', question: 'How can I contact customer support?', answer: 'WhatsApp: +977-9856068470, Email: info@newroadtravels.com, Office: Tourist Bus Park, Sorhakhutte, Kathmandu. Available 24/7.' }
];

const FAQ = () => {
    const [faqs, setFaqs] = useState(HARDCODED_FAQS);
    const [openIndex, setOpenIndex] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        api.getFaqs().then(data => {
            if (Array.isArray(data) && data.length > 0) setFaqs(data);
        }).catch(() => { /* fallback to hardcoded */ });
    }, []);

    const categories = ['all', ...new Set(faqs.map(f => f.category).filter(Boolean))];

    const stripHtml = (html) => html?.replace(/<[^>]*>/g, '') || '';
    const filteredFaqs = faqs.filter(f => {
        const matchesCategory = selectedCategory === 'all' || f.category === selectedCategory;
        const matchesSearch = !searchQuery ||
            f.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
            stripHtml(f.answer).toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    const toggleFaq = (index) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    // JSON-LD structured data for SEO
    const faqJsonLd = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": filteredFaqs.map(faq => ({
            "@type": "Question",
            "name": faq.question,
            "acceptedAnswer": {
                "@type": "Answer",
                "text": faq.answer
            }
        }))
    };

    return (
        <div className="min-h-screen bg-slate-50 pt-20">
            <SEOHead
                title="Frequently Asked Questions"
                description="Find answers to common questions about New Road Travels bus bookings, vehicle rentals, routes, safety, and services. 24/7 support available."
                path="/faq"
                structuredData={faqJsonLd}
            />

            {/* Hero */}
            <BackgroundPaths title="Frequently Asked Questions" />

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Search */}
                <div className="relative mb-8">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => { setSearchQuery(e.target.value); setOpenIndex(null); }}
                        placeholder="Search for a question..."
                        className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl text-slate-800 text-lg focus:outline-none focus:ring-2 focus:ring-nepal-red/30 focus:border-nepal-red shadow-sm"
                    />
                </div>

                {/* Category Pills */}
                <div className="flex flex-wrap gap-3 mb-10 justify-center">
                    {categories.map((cat) => (
                        <button
                            key={cat}
                            onClick={() => { setSelectedCategory(cat); setOpenIndex(null); }}
                            className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all ${selectedCategory === cat
                                ? 'bg-nepal-red text-white shadow-lg shadow-red-900/20'
                                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                                }`}
                        >
                            {cat === 'all' ? 'All Questions' : cat}
                        </button>
                    ))}
                </div>

                {/* FAQ Accordion */}
                {filteredFaqs.length === 0 ? (
                    <div className="text-center py-20">
                        <Search className="mx-auto h-16 w-16 text-slate-300 mb-4" />
                        <h3 className="text-lg font-medium text-slate-900">No matching questions</h3>
                        <p className="mt-2 text-slate-500">Try a different search term or category.</p>
                    </div>
                ) : (
                    <ScrollFAQAccordion data={filteredFaqs} />
                )}

                {/* Contact CTA */}
                <div className="mt-16 bg-gradient-to-r from-nepal-red to-red-700 rounded-2xl p-8 md:p-12 text-center text-white">
                    <h2 className="text-2xl md:text-3xl font-bold mb-4">Still have questions?</h2>
                    <p className="text-red-100 mb-8 max-w-lg mx-auto">
                        Can&apos;t find what you&apos;re looking for? Our team is here to help 24/7.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <a
                            href="https://wa.me/9779856068470?text=Hello%2C%20I%20have%20a%20question%20about%20your%20services"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 bg-white text-green-700 px-6 py-3 rounded-full font-semibold hover:bg-green-50 transition-colors shadow-lg"
                        >
                            <MessageCircle className="w-5 h-5" />
                            Chat on WhatsApp
                        </a>
                        <a
                            href="tel:+9779856068470"
                            className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white px-6 py-3 rounded-full font-semibold hover:bg-white/30 transition-colors border border-white/30"
                        >
                            <Phone className="w-5 h-5" />
                            Call Us
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FAQ;


