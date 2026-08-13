'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard, Bus, Route, CalendarClock, Ticket,
    FileText, Image, Users, Settings, Plug, Palette,
    Moon, Sun, ChevronLeft, ChevronRight, LogOut,
    Package, Car, MessageSquare, MapPin, Megaphone, Info, Phone,
    BookOpen, PenTool, HelpCircle, UserCheck, Trophy, ImageIcon,
    Globe, SlidersHorizontal, Star, Mail, ClipboardList, Handshake, Inbox,
    Film, CreditCard, BarChart3, Zap, Tent
} from 'lucide-react';
import { useStore } from '@/lib/store';
import { useEffect, useState } from 'react';

const globalNavGroups = [
    {
        label: 'Global Hub',
        items: [
            { label: 'Global Dashboard', href: '/dashboard', icon: LayoutDashboard },
            { label: 'Global Analytics & Data', href: '/dashboard/analytics', icon: BarChart3 },
        ],
    },
    {
        label: 'Fleet & Staff',
        items: [
            { label: 'Staff & Team', href: '/dashboard/staff', icon: UserCheck },
            { label: 'Buses', href: '/dashboard/buses', icon: Bus },
            { label: 'Bus Layouts', href: '/dashboard/layouts', icon: Plug },
            { label: 'Routes', href: '/dashboard/routes', icon: Route },
            { label: 'Schedules', href: '/dashboard/schedules', icon: CalendarClock },
        ],
    },
    {
        label: 'Marketing & Settings',
        items: [
            { label: 'System Users', href: '/dashboard/users', icon: Users },
            { label: 'Email Templates & Mails', href: '/dashboard/marketing/emails', icon: Mail },
            { label: 'Marketing Campaigns', href: '/dashboard/marketing/campaigns', icon: Megaphone },
            { label: 'Coupons & Offers', href: '/dashboard/marketing/coupons', icon: Ticket },
        ],
    }
];

const siteNavGroups = [
    {
        label: 'Site Operations',
        items: [
            { label: 'Site Dashboard', href: '/dashboard', icon: LayoutDashboard },
            { label: 'Bookings', href: '/dashboard/bookings', icon: Ticket },
            { label: 'Payments', href: '/dashboard/payments', icon: CreditCard },
            { label: 'Inquiries', href: '/dashboard/inquiries', icon: ClipboardList },
            { label: 'Support Tickets', href: '/dashboard/support-tickets', icon: HelpCircle },
            { label: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
        ],
    },
    {
        label: 'Storefront CMS',
        items: [
            { label: 'Sliders', href: '/dashboard/content/sliders', icon: SlidersHorizontal },
            { label: 'Hero Banners', href: '/dashboard/content/hero-banners', icon: Megaphone },
            { label: 'Blogs', href: '/dashboard/content/blogs', icon: BookOpen },
            { label: 'FAQs', href: '/dashboard/content/faqs', icon: HelpCircle },
            { label: 'Team Members', href: '/dashboard/content/team', icon: UserCheck },
            { label: 'Gallery', href: '/dashboard/content/gallery', icon: ImageIcon },
            { label: 'Testimonials', href: '/dashboard/content/testimonials', icon: MessageSquare },
            { label: 'About Us', href: '/dashboard/content/about', icon: Info },
            { label: 'Contact Info', href: '/dashboard/content/contact', icon: Phone },
        ],
    },
    {
        label: 'Configuration',
        items: [
            { label: 'Media Library', href: '/dashboard/media', icon: Image },
            { label: 'Site Settings', href: '/dashboard/content/site-settings', icon: Globe },
        ],
    },
];


export default function Sidebar() {
    const pathname = usePathname();
    const { sidebarOpen, toggleSidebar, darkMode, toggleDarkMode, user, logout } = useStore();
    const [siteName, setSiteName] = useState('');
    const [siteId, setSiteId] = useState('');

    useEffect(() => {
        if (typeof window !== 'undefined') {
            setSiteName(localStorage.getItem('cms_site_name') || 'Global Context');
            setSiteId(localStorage.getItem('cms_site_id') || '');
        }
    }, []);

    const currentNavGroups = siteId === 'global' ? globalNavGroups : siteNavGroups;

    return (
        <aside
            className={`fixed left-0 top-0 z-40 h-[calc(100vh-2rem)] my-4 ml-4 bg-white/40 dark:bg-gray-900/40 backdrop-blur-xl border border-white/50 dark:border-gray-700/50 rounded-3xl transition-all duration-300 flex flex-col shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] dark:shadow-[0_8px_32px_0_rgba(0,0,0,0.3)]
                ${sidebarOpen ? 'w-[260px] translate-x-0' : '-translate-x-full md:translate-x-0 w-[260px] md:w-[72px]'}
            `}
        >
            {/* Logo */}
            <div className={`flex h-16 items-center ${sidebarOpen ? 'justify-start px-6' : 'justify-center'} pt-2 pb-2`}>
                <Link href="/dashboard" className="flex items-center overflow-hidden">
                    <img src="/logo.jpeg" alt="Logo" className={sidebarOpen ? "h-6 object-contain" : "h-6 w-9 object-cover rounded-lg"} />
                    {sidebarOpen && <span className="ml-3 font-bold text-lg text-materio-textLight dark:text-materio-textDark">CMS</span>}
                </Link>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1 mt-2">
                {currentNavGroups.map((group) => (
                    <div key={group.label}>
                        {sidebarOpen && (
                            <p className="text-[11px] uppercase tracking-wider text-gray-400 dark:text-gray-500 font-semibold px-3 pt-5 pb-2">
                                {group.label}
                            </p>
                        )}
                        {group.items.map(({ label, href, icon: Icon }) => {
                            const isActive = pathname === href || (href !== '/dashboard' && pathname?.startsWith(href));
                            return (
                                <Link
                                    key={href}
                                    href={href}
                                    onClick={() => {
                                        if (typeof window !== 'undefined' && window.innerWidth < 768 && sidebarOpen) {
                                            toggleSidebar();
                                        }
                                    }}
                                    className={`flex items-center gap-3 px-3 py-2.5 rounded-2xl text-sm font-medium transition-all duration-200 group mb-1 ${isActive
                                        ? 'bg-gradient-to-r from-brand-600 to-brand-500 text-white shadow-md shadow-brand-500/30'
                                        : 'text-materio-textLight dark:text-materio-textDark hover:bg-white/50 dark:hover:bg-gray-800/50 hover:text-brand-600 dark:hover:text-white'
                                        }`}
                                    title={!sidebarOpen ? label : undefined}
                                >
                                    <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-white' : 'text-gray-400 dark:text-gray-400 group-hover:text-brand-600 dark:group-hover:text-white'}`} />
                                    {sidebarOpen && <span className="truncate">{label}</span>}
                                </Link>
                            );
                        })}
                    </div>
                ))}
            </nav>


            {/* Bottom Controls */}
            <div className="p-4 space-y-2 mt-auto border-t border-white/20 dark:border-gray-700/20">
                <button
                    onClick={toggleDarkMode}
                    className="flex items-center gap-3 w-full px-3 py-2.5 rounded-2xl text-materio-textLight dark:text-materio-textDark hover:bg-white/50 dark:hover:bg-gray-800/50 text-sm font-medium transition-all group"
                >
                    {darkMode ? <Sun className="w-5 h-5 shrink-0 text-amber-500" /> : <Moon className="w-5 h-5 shrink-0 text-brand-600" />}
                    {sidebarOpen && <span className="group-hover:text-brand-600 dark:group-hover:text-white">{darkMode ? 'Light Mode' : 'Dark Mode'}</span>}
                </button>

                {user && sidebarOpen && (
                    <div className="flex flex-col gap-2">
                        <Link href="/sites" className="flex items-center justify-between px-3 py-2 rounded-2xl bg-white/60 dark:bg-gray-800/60 border border-white/50 dark:border-gray-700/50 text-xs transition-colors hover:bg-white dark:hover:bg-gray-700/60 shadow-sm">
                            <div className="flex items-center gap-2">
                                <Globe className="w-4 h-4 text-brand-600 dark:text-brand-400" />
                                <span className="font-bold text-gray-800 dark:text-gray-200 truncate max-w-[140px]">{siteName}</span>
                            </div>
                            <span className="text-[10px] text-brand-500 font-bold bg-brand-50 dark:bg-brand-900/30 px-2 py-0.5 rounded-full">Switch</span>
                        </Link>

                        <div className="flex items-center gap-3 px-3 py-3 rounded-2xl bg-white/40 dark:bg-gray-800/40 border border-white/50 dark:border-gray-700/50">
                            <div className="w-8 h-8 bg-brand-500 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-sm shadow-brand-500/30">
                                {user.firstName?.[0] || ''}{user.lastName?.[0] || ''}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-gray-900 dark:text-white text-xs font-semibold truncate">{user.firstName} {user.lastName}</p>
                                <p className="text-gray-500 dark:text-gray-400 text-[10px] truncate capitalize">{user.role?.replace('_', ' ')}</p>
                            </div>
                            <button onClick={() => {
                                localStorage.removeItem('cms_token');
                                localStorage.removeItem('cms_site_id');
                                localStorage.removeItem('cms_site_name');
                                logout();
                            }} className="text-gray-400 hover:text-red-500 transition-colors">
                                <LogOut className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}

                <button
                    onClick={toggleSidebar}
                    className="hidden md:flex items-center justify-center w-full px-3 py-2 rounded-lg text-gray-400 hover:bg-sidebar-hoverLight dark:hover:bg-sidebar-hoverDark hover:text-gray-600 dark:hover:text-white transition-all"
                >
                    {sidebarOpen ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                </button>
            </div>
        </aside>
    );
}
