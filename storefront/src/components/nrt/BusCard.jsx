import React from 'react';
import { Link } from 'react-router-dom';

const BusCard = ({ bus }) => {
    // Mock data fallbacks
    const {
        trip_id = 1,
        registration_number = 'KA-01-F-1234',
        type = 'Volvo Multi-Axle A/C Sleeper',
        departure_time = '2024-03-20T22:00:00',
        arrival_time = '2024-03-21T06:00:00',
        price = 1200
    } = bus;

    const depDate = new Date(departure_time);
    const arrDate = new Date(arrival_time);

    const diffMs = arrDate - depDate;
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    const duration = `${hours}h ${minutes}m`;

    return (
        <div className="p-6 bg-gray-800 rounded-lg border border-gray-700 hover:border-red-500 transition-colors flex flex-col md:flex-row justify-between items-start md:items-center">
            <div className="mb-4 md:mb-0">
                <h3 className="text-xl font-bold text-white">{type}</h3>
                <p className="text-sm text-gray-400 mb-2">{registration_number}</p>
                <div className="flex items-center space-x-4 text-sm text-gray-300">
                    <div>
                        <p className="font-bold text-lg">{depDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                        <p className="text-xs text-gray-500">Departure</p>
                    </div>
                    <div className="text-gray-500">--- {duration}h ---</div>
                    <div>
                        <p className="font-bold text-lg">{arrDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                        <p className="text-xs text-gray-500">Arrival</p>
                    </div>
                </div>
            </div>

            <div className="flex flex-col items-end gap-2">
                <span className="text-2xl font-bold text-red-400"><span className="text-[11px] text-red-400/80 mr-1 font-bold uppercase tracking-wider">NPR</span>{price}</span>
                <Link to={`/booking/${trip_id}`}>
                    <button className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded transition-transform active:scale-95">
                        View Seats
                    </button>
                </Link>
            </div>
        </div>
    );
};

export default BusCard;

