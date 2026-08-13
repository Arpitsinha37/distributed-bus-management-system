'use client';

import { useState } from 'react';
import { useStore } from '@/lib/store';
import { Settings, Globe, Bell, Shield, CreditCard, Save, Check } from 'lucide-react';

export default function SettingsPage() {
    const { user } = useStore();
    const [saved, setSaved] = useState(false);
    const [general, setGeneral] = useState({
        companyName: 'New Road Travels',
        tagline: 'Your trusted travel partner in Nepal',
        contactEmail: 'info@newroadtravels.com',
        contactPhone: '+977-01-4232115',
        address: 'New Road, Kathmandu, Nepal',
        currency: 'NPR',
        timezone: 'Asia/Kathmandu',
        language: 'en',
    });
    const [notifications, setNotifications] = useState({
        emailOnBooking: true,
        emailOnCancel: true,
        smsOnBooking: false,
        dailyReport: true,
    });
    const [activeTab, setActiveTab] = useState<'general' | 'notifications' | 'security' | 'billing'>('general');

    const handleSave = () => {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    const tabs = [
        { id: 'general' as const, label: 'General', icon: Globe },
        { id: 'notifications' as const, label: 'Notifications', icon: Bell },
        { id: 'security' as const, label: 'Security', icon: Shield },
        { id: 'billing' as const, label: 'Billing', icon: CreditCard },
    ];

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <Settings className="w-6 h-6 text-gray-500" /> Settings
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">Configure your platform preferences</p>
                </div>
                <button onClick={handleSave}
                    className="flex items-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium text-sm transition-colors disabled:opacity-50">
                    {saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                    {saved ? 'Saved!' : 'Save Changes'}
                </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-200 dark:border-gray-800 mb-6">
                {tabs.map(t => (
                    <button key={t.id} onClick={() => setActiveTab(t.id)}
                        className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === t.id ? 'border-red-600 text-red-600' : 'border-transparent text-gray-400 hover:text-gray-600'
                            }`}>
                        <t.icon className="w-4 h-4" />{t.label}
                    </button>
                ))}
            </div>

            <div className="max-w-2xl">
                {activeTab === 'general' && (
                    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 space-y-5">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">General Settings</h2>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Company Name</label>
                            <input type="text" value={general.companyName} onChange={e => setGeneral({ ...general, companyName: e.target.value })}
                                className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm outline-none" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tagline</label>
                            <input type="text" value={general.tagline} onChange={e => setGeneral({ ...general, tagline: e.target.value })}
                                className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm outline-none" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Contact Email</label>
                                <input type="email" value={general.contactEmail} onChange={e => setGeneral({ ...general, contactEmail: e.target.value })}
                                    className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm outline-none" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Contact Phone</label>
                                <input type="tel" value={general.contactPhone} onChange={e => setGeneral({ ...general, contactPhone: e.target.value })}
                                    className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm outline-none" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Address</label>
                            <textarea value={general.address} onChange={e => setGeneral({ ...general, address: e.target.value })} rows={2}
                                className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm outline-none resize-none" />
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Currency</label>
                                <select value={general.currency} onChange={e => setGeneral({ ...general, currency: e.target.value })}
                                    className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm outline-none">
                                    <option value="NPR">NPR (रू)</option>
                                    <option value="INR">INR (₹)</option>
                                    <option value="USD">USD ($)</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Timezone</label>
                                <select value={general.timezone} onChange={e => setGeneral({ ...general, timezone: e.target.value })}
                                    className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm outline-none">
                                    <option value="Asia/Kathmandu">Asia/Kathmandu (+5:45)</option>
                                    <option value="Asia/Kolkata">Asia/Kolkata (+5:30)</option>
                                    <option value="UTC">UTC</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Language</label>
                                <select value={general.language} onChange={e => setGeneral({ ...general, language: e.target.value })}
                                    className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm outline-none">
                                    <option value="en">English</option>
                                    <option value="ne">नेपाली</option>
                                </select>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'notifications' && (
                    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 space-y-5">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Notification Preferences</h2>
                        {([
                            { key: 'emailOnBooking' as const, label: 'Email on new booking', desc: 'Receive an email when a new booking is made' },
                            { key: 'emailOnCancel' as const, label: 'Email on cancellation', desc: 'Receive an email when a booking is cancelled' },
                            { key: 'smsOnBooking' as const, label: 'SMS on new booking', desc: 'Send SMS notification for new bookings' },
                            { key: 'dailyReport' as const, label: 'Daily report', desc: 'Receive a daily summary email' },
                        ]).map(item => (
                            <div key={item.key} className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-800 last:border-0">
                                <div>
                                    <p className="text-sm font-medium text-gray-900 dark:text-white">{item.label}</p>
                                    <p className="text-xs text-gray-400 mt-0.5">{item.desc}</p>
                                </div>
                                <button onClick={() => setNotifications({ ...notifications, [item.key]: !notifications[item.key] })}
                                    className={`w-11 h-6 rounded-full transition-colors relative ${notifications[item.key] ? 'bg-red-600' : 'bg-gray-200 dark:bg-gray-700'}`}>
                                    <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${notifications[item.key] ? 'translate-x-5.5 left-0.5' : 'left-0.5'}`}
                                        style={{ transform: notifications[item.key] ? 'translateX(22px)' : 'translateX(0)' }} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {activeTab === 'security' && (
                    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 space-y-5">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Security Settings</h2>
                        <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                            <p className="text-sm font-medium text-green-700 dark:text-green-400 flex items-center gap-2">
                                <Shield className="w-4 h-4" /> Security Status: All Good
                            </p>
                            <p className="text-xs text-green-600 dark:text-green-500 mt-1">JWT authentication, RBAC, rate limiting, and Helmet are active</p>
                        </div>
                        <div className="space-y-3">
                            <p className="text-sm text-gray-500">• JWT access tokens expire in 15 minutes</p>
                            <p className="text-sm text-gray-500">• Refresh tokens expire in 7 days</p>
                            <p className="text-sm text-gray-500">• Passwords hashed with bcrypt (12 rounds)</p>
                            <p className="text-sm text-gray-500">• Rate limited to 100 requests per minute</p>
                            <p className="text-sm text-gray-500">• CORS enabled for admin panel only</p>
                        </div>
                    </div>
                )}

                {activeTab === 'billing' && (
                    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 space-y-5">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Billing & Plan</h2>
                        <div className="p-4 bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-bold text-red-700 dark:text-red-400">Enterprise Plan</p>
                                    <p className="text-xs text-red-500 mt-0.5">Unlimited buses, routes, and bookings</p>
                                </div>
                                <span className="px-3 py-1 bg-red-600 text-white text-xs font-bold rounded-full">ACTIVE</span>
                            </div>
                        </div>
                        <p className="text-xs text-gray-400">Contact support for plan changes: support@adfusionnepal.com</p>
                    </div>
                )}
            </div>
        </div>
    );
}
