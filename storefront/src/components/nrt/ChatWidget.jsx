import React, { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { X, Send } from 'lucide-react';

const WHATSAPP_NUMBER = "9779856068470";

const ChatWidget = () => {
    const location = useLocation();
    const isHiddenOnMobile = location.pathname.startsWith('/booking') || location.pathname.startsWith('/passenger-details');
    const [calendarOpen, setCalendarOpen] = useState(false);

    // Hide chat widget when calendar is open
    useEffect(() => {
        const handleCalendarOpen = () => setCalendarOpen(true);
        const handleCalendarClose = () => setCalendarOpen(false);
        window.addEventListener('calendar-open', handleCalendarOpen);
        window.addEventListener('calendar-close', handleCalendarClose);
        return () => {
            window.removeEventListener('calendar-open', handleCalendarOpen);
            window.removeEventListener('calendar-close', handleCalendarClose);
        };
    }, []);

    const [isOpen, setIsOpen] = useState(false);
    const [input, setInput] = useState('');
    const inputRef = useRef(null);

    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isOpen]);

    const sendMessage = () => {
        const text = input.trim() || 'Hello! I need some help with my bus booking.';
        const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
        window.open(url, '_blank');
        setIsOpen(false);
        setInput('');
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    return (
        <>
            {/* WhatsApp Floating Button */}
            {!isOpen && !calendarOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className={`fixed bottom-24 sm:bottom-6 right-6 z-50 bg-[#25D366] text-white rounded-full w-16 h-16 items-center justify-center shadow-2xl shadow-[#25D366]/40 hover:scale-110 transition-all duration-300 group ${isHiddenOnMobile ? 'hidden sm:flex' : 'flex'}`}
                    aria-label="Open WhatsApp"
                >
                    <svg viewBox="0 0 24 24" className="w-8 h-8 group-hover:scale-110 transition-transform" fill="currentColor">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.888-.788-1.489-1.761-1.663-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
                    {/* Pulse animation */}
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white animate-pulse" />
                </button>
            )}

            {/* WhatsApp Chat Window */}
            {isOpen && !calendarOpen && (
                <div className={`fixed bottom-4 right-4 z-[60] w-[360px] max-w-[calc(100vw-2rem)] bg-[#e5ddd5] rounded-2xl shadow-2xl shadow-black/20 flex-col overflow-hidden border border-slate-200 animate-in ${isHiddenOnMobile ? 'hidden sm:flex' : 'flex'}`}>
                    {/* Header */}
                    <div className="bg-[#075E54] px-4 py-4 flex items-center justify-between flex-shrink-0">
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <img src="/favicon.ico" alt="NRT" className="w-10 h-10 bg-white rounded-full object-cover border-2 border-white/20" onError={(e) => e.target.src = 'https://ui-avatars.com/api/?name=NRT&background=ffffff&color=075E54'} />
                                <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-[#075E54] rounded-full"></span>
                            </div>
                            <div>
                                <h3 className="text-white font-bold text-[15px]">New Road Travels</h3>
                                <p className="text-white/80 text-xs mt-0.5">Typically replies instantly</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="text-white/80 hover:text-white transition-colors p-1.5"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Messages Body */}
                    <div className="flex-1 p-5 space-y-4" style={{ backgroundImage: "url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')", backgroundSize: 'cover', backgroundBlendMode: 'overlay', backgroundColor: 'rgba(229, 221, 213, 0.9)' }}>
                        <div className="flex justify-center mb-4">
                            <span className="bg-[#E1F3FB] text-slate-600 text-[11px] px-3 py-1 rounded-lg shadow-sm font-medium">
                                Today
                            </span>
                        </div>
                        
                        {/* Bot Greeting */}
                        <div className="flex gap-2.5">
                            <div className="max-w-[85%] bg-white px-3.5 py-2.5 rounded-2xl rounded-tl-sm text-[14px] text-slate-800 shadow-sm relative">
                                Namaste! 🙏 Welcome to New Road Travels & Tours. How can we help you today?
                                <span className="text-[10px] text-slate-400 block text-right mt-1">Just now</span>
                            </div>
                        </div>
                    </div>

                    {/* Input */}
                    <div className="p-3 bg-[#f0f0f0] border-t border-slate-200">
                        <div className="flex items-center gap-2 bg-white rounded-full pl-4 pr-1.5 py-1.5 shadow-sm border border-slate-200 focus-within:border-[#25D366] transition-colors">
                            <input
                                ref={inputRef}
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Type a message..."
                                className="flex-1 bg-transparent py-1.5 text-[15px] text-slate-800 placeholder-slate-400 focus:outline-none"
                            />
                            <button
                                onClick={sendMessage}
                                className={`w-9 h-9 rounded-full flex items-center justify-center transition-all flex-shrink-0 ${input.trim() ? 'bg-[#25D366] hover:bg-[#1DA851] text-white' : 'bg-slate-200 text-slate-400 cursor-default'}`}
                            >
                                <Send className="w-4 h-4 ml-0.5" />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                .animate-in {
                    animation: slideUp 0.2s cubic-bezier(0.16, 1, 0.3, 1);
                }
                @keyframes slideUp {
                    from { opacity: 0; transform: translateY(10px) scale(0.98); }
                    to { opacity: 1; transform: translateY(0) scale(1); }
                }
            `}</style>
        </>
    );
};

export default ChatWidget;

