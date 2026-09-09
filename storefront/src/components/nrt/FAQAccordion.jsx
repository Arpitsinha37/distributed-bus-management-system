import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

/**
 * Lightweight animated FAQ accordion for detail pages.
 * Same smooth framer-motion animation as the main FAQ page
 * but without GSAP scroll-pinning.
 */
const FAQAccordion = ({ faqs = [], className = '' }) => {
    const [openIndex, setOpenIndex] = useState(null);

    if (!faqs || faqs.length === 0) return null;

    return (
        <div className={`space-y-3 ${className}`}>
            {faqs.map((faq, idx) => {
                const isOpen = openIndex === idx;
                return (
                    <div
                        key={idx}
                        className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden transition-shadow hover:shadow-md"
                    >
                        <button
                            onClick={() => setOpenIndex(isOpen ? null : idx)}
                            className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left transition-colors"
                        >
                            <span className={`font-semibold text-base transition-colors ${isOpen ? 'text-nepal-red' : 'text-slate-800'}`}>
                                {faq.question}
                            </span>
                            <motion.span
                                animate={{ rotate: isOpen ? 180 : 0 }}
                                transition={{ duration: 0.3, ease: 'easeInOut' }}
                                className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-colors ${isOpen ? 'bg-nepal-red text-white' : 'bg-slate-100 text-slate-500'}`}
                            >
                                <ChevronDown className="w-4 h-4" />
                            </motion.span>
                        </button>

                        <AnimatePresence initial={false}>
                            {isOpen && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
                                    className="overflow-hidden"
                                >
                                    <div className="px-6 pb-5 text-sm text-slate-600 leading-relaxed border-t border-slate-50 pt-4 prose prose-sm max-w-none prose-a:text-nepal-red"
                                        dangerouslySetInnerHTML={{ __html: faq.answer }}
                                    />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                );
            })}
        </div>
    );
};

export default FAQAccordion;

