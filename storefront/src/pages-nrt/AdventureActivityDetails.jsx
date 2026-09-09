import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Clock, Mountain, ArrowLeft, ArrowRight, Activity } from 'lucide-react';
import SEOHead from '../components/nrt/SEOHead';
import api from '../lib/api';
import { getImageUrl } from '../lib/utils';

const AdventureActivityDetails = () => {
    const { slug } = useParams();
    const [activity, setActivity] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchActivity = async () => {
            setLoading(true);
            try {
                const data = await api.getAdventureActivityBySlug(slug);
                if (!data) {
                    setError('Adventure activity not found');
                } else {
                    setActivity(data);
                }
            } catch (err) {
                setError('Failed to load adventure activity');
            } finally {
                setLoading(false);
            }
        };
        fetchActivity();
    }, [slug]);

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center pt-20">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-red-500 border-t-transparent"></div>
            </div>
        );
    }

    if (error || !activity) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center pt-20 gap-4">
                <p className="text-xl text-slate-500">{error || 'Activity not found'}</p>
                <Link to="/" className="text-red-600 hover:text-red-700 font-medium flex items-center gap-2">
                    <ArrowLeft className="w-4 h-4" /> Back to Home
                </Link>
            </div>
        );
    }

    const plainDesc = (activity.description || '').replace(/<[^>]*>/g, '').substring(0, 160) || `Experience the thrill of ${activity.name}`;

    return (
        <div className="min-h-screen bg-slate-50">
            <SEOHead
                title={`${activity.name} | New Road Travels`}
                description={plainDesc}
                path={`/adventure-activities/${slug}`}
                image={activity.image ? getImageUrl(activity.image) : undefined}
            />

            {/* Hero Section */}
            <div className="relative h-[50vh] md:h-[60vh] w-full overflow-hidden">
                {activity.image ? (
                    <img src={getImageUrl(activity.image)} alt={activity.name} className="w-full h-full object-cover" loading="lazy" />
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-red-900 to-slate-900 flex items-center justify-center">
                        <Activity className="w-24 h-24 text-white/30" />
                    </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12 max-w-7xl mx-auto">
                    <Link to="/" className="inline-flex items-center gap-2 text-white/80 hover:text-white text-sm mb-4 transition-colors">
                        <ArrowLeft className="w-4 h-4" /> Back to Home
                    </Link>
                    <h1 className="text-3xl md:text-5xl font-bold text-white mb-2">{activity.name}</h1>
                    <div className="flex flex-wrap items-center gap-4 text-white/90 text-sm md:text-base">
                        {activity.duration && (
                            <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" /> {activity.duration}</span>
                        )}
                        {activity.price && (
                            <span className="flex items-center gap-1.5 font-bold text-red-400">NPR {activity.price}</span>
                        )}
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

                    {/* Left: Details */}
                    <div className="lg:col-span-2 space-y-8">

                        {/* Description / Content */}
                        {activity.content && (
                            <div>
                                <h2 className="text-2xl font-bold text-slate-900 mb-4">About {activity.name}</h2>
                                <div className="prose prose-slate max-w-none bg-white rounded-xl p-6 shadow-sm border border-slate-100"
                                    dangerouslySetInnerHTML={{ __html: activity.content }}
                                />
                            </div>
                        )}
                        
                        {!activity.content && activity.description && (
                            <div>
                                <h2 className="text-2xl font-bold text-slate-900 mb-4">About {activity.name}</h2>
                                <div className="prose prose-slate max-w-none bg-white rounded-xl p-6 shadow-sm border border-slate-100"
                                    dangerouslySetInnerHTML={{ __html: activity.description }}
                                />
                            </div>
                        )}

                        {/* Details Table */}
                        {activity.detailsTable && Array.isArray(activity.detailsTable) && activity.detailsTable.length > 0 && (
                            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
                                <h3 className="text-lg font-bold text-slate-900 mb-4">Activity Details</h3>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <tbody>
                                            {activity.detailsTable.map((row, index) => (
                                                <tr key={index} className="border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors">
                                                    <th className="py-3 pr-4 font-semibold text-slate-700 w-1/3 align-top">
                                                        {row.key}
                                                    </th>
                                                    <td className="py-3 text-slate-600 align-top">
                                                        {row.value}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                    </div>

                    {/* Right: Booking Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-28 bg-white rounded-2xl shadow-lg border border-slate-100 p-6 space-y-6">
                            
                            {activity.price && (
                                <div className="bg-red-50 rounded-2xl p-6 flex flex-col justify-center items-center gap-2 shadow-sm border border-red-100">
                                    <p className="text-sm text-red-600 font-semibold uppercase tracking-wider">Activity Price</p>
                                    <p className="text-3xl font-bold text-red-600"><span className="text-xl text-red-500/80 mr-1.5 font-semibold">NPR</span>{activity.price}</p>
                                </div>
                            )}

                            <div className="space-y-3 text-sm">
                                {activity.duration && (
                                    <div className="flex items-center gap-3 text-slate-600">
                                        <Clock className="w-5 h-5 text-slate-400" />
                                        <span>Duration: {activity.duration}</span>
                                    </div>
                                )}
                            </div>

                            <a
                                href={`https://wa.me/9779856068470?text=${encodeURIComponent(`Hi! I'm interested in the "${activity.name}" adventure.`)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block w-full bg-green-600 hover:bg-green-700 text-white text-center font-bold py-3 px-6 rounded-xl transition-all active:scale-95 shadow-md"
                            >
                                📱 Inquire on WhatsApp
                            </a>

                            <a
                                href="tel:+9779856068470"
                                className="block w-full bg-red-600 hover:bg-red-700 text-white text-center font-bold py-3 px-6 rounded-xl transition-all active:scale-95 shadow-md"
                            >
                                📞 Call to Book
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdventureActivityDetails;


