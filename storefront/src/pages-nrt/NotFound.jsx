import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaBus, FaHome, FaSearch, FaArrowLeft } from 'react-icons/fa';
import SEOHead from '../components/nrt/SEOHead';

const NotFound = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center px-4 pt-16 pb-10">
            <SEOHead title="Page Not Found" description="The page you're looking for doesn't exist." noIndex={true} />

            <div className="max-w-md w-full text-center">
                {/* Animated 404 */}
                <div className="relative mb-8">
                    <h1 className="text-[120px] font-black text-gray-100 leading-none select-none">404</h1>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-rose-500 rounded-2xl flex items-center justify-center shadow-xl shadow-red-200 rotate-12 hover:rotate-0 transition-transform duration-500">
                            <FaBus className="text-white text-3xl" />
                        </div>
                    </div>
                </div>

                <h2 className="text-2xl font-bold text-gray-800 mb-2">Wrong Destination!</h2>
                <p className="text-gray-500 mb-8 text-sm leading-relaxed">
                    Looks like this bus took a wrong turn. The page you're looking for doesn't exist or has been moved.
                </p>

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <button
                        onClick={() => navigate('/')}
                        className="flex items-center justify-center gap-2 bg-gradient-to-r from-red-500 to-rose-500 text-white font-bold py-3 px-6 rounded-xl hover:from-red-600 hover:to-rose-600 transition-all shadow-md shadow-red-200 active:scale-[0.98]"
                    >
                        <FaHome className="text-sm" />
                        Go Home
                    </button>
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center justify-center gap-2 border-2 border-gray-200 text-gray-600 font-bold py-3 px-6 rounded-xl hover:bg-gray-50 transition-all"
                    >
                        <FaArrowLeft className="text-sm" />
                        Go Back
                    </button>
                </div>
            </div>
        </div>
    );
};

export default NotFound;


