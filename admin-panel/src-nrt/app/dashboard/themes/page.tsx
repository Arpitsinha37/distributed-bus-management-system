'use client';

import { useState } from 'react';
import { Palette, Check, Eye, Monitor, Smartphone, Tablet } from 'lucide-react';

interface ThemeItem {
    id: string;
    name: string;
    displayName: string;
    description: string;
    thumbnail: string;
    colors: { primary: string; secondary: string; accent: string };
    active: boolean;
}

const themes: ThemeItem[] = [
    {
        id: '1', name: 'default', displayName: 'Classic Red', description: 'Clean and professional red theme — the default New Road Travels look',
        thumbnail: '', colors: { primary: '#DC2626', secondary: '#1E293B', accent: '#F97316' }, active: true,
    },
    {
        id: '2', name: 'ocean-blue', displayName: 'Ocean Blue', description: 'Cool and calm blue theme for a modern travel experience',
        thumbnail: '', colors: { primary: '#2563EB', secondary: '#0F172A', accent: '#06B6D4' }, active: false,
    },
    {
        id: '3', name: 'forest-green', displayName: 'Forest Green', description: 'Nature-inspired green theme for eco-conscious travelers',
        thumbnail: '', colors: { primary: '#16A34A', secondary: '#14532D', accent: '#84CC16' }, active: false,
    },
    {
        id: '4', name: 'purple-dusk', displayName: 'Purple Dusk', description: 'Elegant purple theme for premium travel services',
        thumbnail: '', colors: { primary: '#9333EA', secondary: '#1E1B4B', accent: '#F472B6' }, active: false,
    },
    {
        id: '5', name: 'sunset-orange', displayName: 'Sunset Orange', description: 'Warm and vibrant theme for adventurous travelers',
        thumbnail: '', colors: { primary: '#EA580C', secondary: '#431407', accent: '#FBBF24' }, active: false,
    },
    {
        id: '6', name: 'midnight', displayName: 'Midnight Dark', description: 'Full dark theme with high contrast for night-time browsing',
        thumbnail: '', colors: { primary: '#6366F1', secondary: '#020617', accent: '#818CF8' }, active: false,
    },
];

export default function ThemesPage() {
    const [activeTheme, setActiveTheme] = useState('default');
    const [preview, setPreview] = useState<ThemeItem | null>(null);
    const [previewDevice, setPreviewDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');

    const activateTheme = (name: string) => {
        setActiveTheme(name);
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <Palette className="w-6 h-6 text-amber-500" /> Theme Manager
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">Customize the look and feel of your public-facing pages</p>
                </div>
            </div>

            {/* Active Theme Banner */}
            <div className="bg-gradient-to-r from-red-600 to-orange-500 rounded-xl p-5 text-white mb-6">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-xs uppercase tracking-widest font-semibold opacity-80">Active Theme</p>
                        <h2 className="text-xl font-bold mt-1">{themes.find(t => t.name === activeTheme)?.displayName}</h2>
                        <p className="text-sm opacity-80 mt-0.5">{themes.find(t => t.name === activeTheme)?.description}</p>
                    </div>
                    <div className="flex gap-2">
                        {Object.entries(themes.find(t => t.name === activeTheme)?.colors || {}).map(([key, color]) => (
                            <div key={key} className="text-center">
                                <div className="w-8 h-8 rounded-lg border-2 border-white/30 shadow-lg" style={{ backgroundColor: color }} />
                                <p className="text-[9px] mt-1 opacity-70">{key}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Themes Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {themes.map(theme => (
                    <div key={theme.id}
                        className={`bg-white dark:bg-gray-900 border rounded-xl overflow-hidden hover:shadow-lg transition-all ${activeTheme === theme.name ? 'border-red-500 ring-2 ring-red-500/20' : 'border-gray-200 dark:border-gray-800'
                            }`}>
                        {/* Color Preview */}
                        <div className="h-24 relative" style={{ background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.secondary})` }}>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="flex gap-2">
                                    {Object.values(theme.colors).map((c, i) => (
                                        <div key={i} className="w-6 h-6 rounded-full border-2 border-white/40 shadow" style={{ backgroundColor: c }} />
                                    ))}
                                </div>
                            </div>
                            {activeTheme === theme.name && (
                                <div className="absolute top-2 right-2 bg-white rounded-full p-1">
                                    <Check className="w-3.5 h-3.5 text-red-600" />
                                </div>
                            )}
                        </div>

                        <div className="p-4">
                            <h3 className="font-semibold text-gray-900 dark:text-white">{theme.displayName}</h3>
                            <p className="text-xs text-gray-500 mt-1">{theme.description}</p>
                            <div className="flex gap-2 mt-4">
                                <button onClick={() => setPreview(theme)}
                                    className="flex-1 flex items-center justify-center gap-1.5 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                    <Eye className="w-3.5 h-3.5" /> Preview
                                </button>
                                {activeTheme === theme.name ? (
                                    <button disabled className="flex-1 py-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-lg text-sm font-medium cursor-default">
                                        ✓ Active
                                    </button>
                                ) : (
                                    <button onClick={() => activateTheme(theme.name)}
                                        className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors">
                                        Activate
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Preview Modal */}
            {preview && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setPreview(null)}>
                    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-4xl border border-gray-200 dark:border-gray-800 overflow-hidden" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
                            <h2 className="font-bold text-gray-900 dark:text-white">{preview.displayName} — Preview</h2>
                            <div className="flex items-center gap-2">
                                {([['desktop', Monitor], ['tablet', Tablet], ['mobile', Smartphone]] as const).map(([dev, Icon]) => (
                                    <button key={dev} onClick={() => setPreviewDevice(dev)}
                                        className={`p-2 rounded-lg ${previewDevice === dev ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white' : 'text-gray-400'}`}>
                                        <Icon className="w-4 h-4" />
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="p-6 flex justify-center bg-gray-50 dark:bg-gray-950">
                            <div className={`bg-white dark:bg-gray-900 rounded-xl overflow-hidden shadow-xl transition-all ${previewDevice === 'mobile' ? 'w-[375px]' : previewDevice === 'tablet' ? 'w-[768px]' : 'w-full'
                                }`}>
                                {/* Mock Header */}
                                <div className="h-14 flex items-center px-4" style={{ backgroundColor: preview.colors.secondary }}>
                                    <span className="text-white font-bold text-sm">New Road Travels</span>
                                    <div className="ml-auto flex gap-3">
                                        {['Routes', 'Booking', 'Contact'].map(l => (
                                            <span key={l} className="text-white/60 text-xs">{l}</span>
                                        ))}
                                    </div>
                                </div>
                                {/* Mock Hero */}
                                <div className="h-40 flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${preview.colors.primary}, ${preview.colors.accent})` }}>
                                    <div className="text-center text-white">
                                        <h3 className="text-xl font-bold">Book Your Journey</h3>
                                        <p className="text-sm opacity-80 mt-1">Travel across Nepal with comfort</p>
                                        <button className="mt-3 px-4 py-2 bg-white/20 backdrop-blur rounded-lg text-sm font-medium">Search Buses</button>
                                    </div>
                                </div>
                                {/* Mock Cards */}
                                <div className="p-4 grid grid-cols-3 gap-3">
                                    {['Kathmandu–Pokhara', 'Pokhara–Lumbini', 'Kathmandu–Chitwan'].map(r => (
                                        <div key={r} className="border border-gray-100 dark:border-gray-800 rounded-lg p-3">
                                            <p className="text-xs font-medium text-gray-900 dark:text-white">{r}</p>
                                            <p className="text-[10px] text-gray-400 mt-1">From NPR 800</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 p-4 border-t border-gray-200 dark:border-gray-800">
                            <button onClick={() => setPreview(null)} className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm">Close</button>
                            {activeTheme !== preview.name && (
                                <button onClick={() => { activateTheme(preview.name); setPreview(null); }}
                                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium">Activate Theme</button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
