import { useState, useEffect } from 'react';
import { apiGet, apiPost } from '@/lib/api';
import { useStore } from '@/lib/store';
import { X, CalendarDays, Bus, MapPin, Users } from 'lucide-react';

export default function CounterBookingModal({ onClose, onSuccess }: { onClose: () => void, onSuccess: () => void }) {
    const { accessToken } = useStore();
    const [trips, setTrips] = useState<any[]>([]);
    const [selectedTrip, setSelectedTrip] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    // Form
    const [customerName, setCustomerName] = useState('');
    const [customerPhone, setCustomerPhone] = useState('');
    const [customerEmail, setCustomerEmail] = useState('');
    const [seatNumbers, setSeatNumbers] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('CASH');

    useEffect(() => {
        // Fetch upcoming trips
        apiGet('/trips?limit=50', accessToken!).then((res: any) => {
            setTrips(res.data || []);
        });
    }, [accessToken]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedTrip) return alert('Select a trip');
        
        const seats = seatNumbers.split(',').map(s => s.trim()).filter(Boolean);
        if (seats.length === 0) return alert('Enter seats');

        setLoading(true);
        try {
            const passengers = seats.map(s => ({ name: customerName, seatNumber: s }));
            const payload = {
                tripId: selectedTrip.id,
                scheduleId: selectedTrip.scheduleId,
                seats: seats.map(s => ({ number: s, type: 'standard' })), // simplify for counter
                customerName,
                customerPhone,
                customerEmail,
                passengers,
                paymentMethod,
            };

            await apiPost('/bookings/counter', payload, accessToken!);
            alert('Booking created successfully! SMS sent to customer.');
            onSuccess();
            onClose();
        } catch (err: any) {
            alert(err.message || 'Failed to create booking');
        }
        setLoading(false);
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-full max-w-2xl border border-gray-200 dark:border-gray-800 overflow-hidden flex flex-col max-h-[90vh]">
                <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">Counter Booking</h2>
                    <button onClick={onClose} className="p-2 text-gray-400 hover:text-red-500 rounded-lg"><X className="w-5 h-5" /></button>
                </div>
                
                <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Select Trip</label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-48 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-xl p-2">
                            {trips.length === 0 && <p className="text-sm text-gray-400 p-2">No trips available</p>}
                            {trips.map(t => (
                                <div key={t.id} 
                                    onClick={() => setSelectedTrip(t)}
                                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${selectedTrip?.id === t.id ? 'border-red-500 bg-red-50 dark:bg-red-900/20' : 'border-gray-200 dark:border-gray-700 hover:border-red-300'}`}>
                                    <p className="font-bold text-gray-900 dark:text-white text-sm">{t.schedule?.route?.origin} → {t.schedule?.route?.destination}</p>
                                    <p className="text-xs text-gray-500 flex items-center gap-1 mt-1"><CalendarDays className="w-3 h-3"/> {new Date(t.travelDate).toLocaleDateString()}</p>
                                    <p className="text-xs text-gray-500 flex items-center gap-1"><Bus className="w-3 h-3"/> {t.bus?.plateNumber}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Customer Name *</label>
                            <input required type="text" value={customerName} onChange={e => setCustomerName(e.target.value)} className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm outline-none" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone *</label>
                            <input required type="text" value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm outline-none" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email (Optional)</label>
                            <input type="email" value={customerEmail} onChange={e => setCustomerEmail(e.target.value)} className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm outline-none" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Seats (comma separated) *</label>
                            <input required type="text" placeholder="e.g. A1, A2" value={seatNumbers} onChange={e => setSeatNumbers(e.target.value)} className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm outline-none uppercase" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Payment Method</label>
                            <select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)} className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm outline-none">
                                <option value="CASH">Cash (Counter)</option>
                                <option value="ONLINE">Online/Transfer</option>
                            </select>
                        </div>
                    </div>
                    
                    <div className="pt-2 border-t border-gray-100 dark:border-gray-800">
                        <button disabled={loading} type="submit" className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-xl text-sm transition-colors disabled:opacity-50">
                            {loading ? 'Processing...' : 'Confirm & Print Ticket'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
