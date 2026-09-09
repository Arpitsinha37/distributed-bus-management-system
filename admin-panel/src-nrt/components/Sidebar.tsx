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

const navGroups = [
    {
        label: 'Main',
        items: [
            { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
            { label: 'Marketing Hub', href: '/dashboard/content/email-subscribers', icon: Megaphone },
            { label: 'Campaign Studio', href: '/dashboard/campaigns', icon: Mail },
            { label: 'Automations', href: '/dashboard/automations', icon: Zap },
            { label: 'Booking Inquiries', href: '/dashboard/inquiries', icon: ClipboardList },
            { label: 'Partner Requests', href: '/dashboard/partner-requests', icon: Handshake },
            { label: 'Contact Submissions', href: '/dashboard/contact-submissions', icon: Inbox },
            { label: 'Support Tickets', href: '/dashboard/support-tickets', icon: MessageSquare },
        ],
    },
    {
        label: 'Transport',
        items: [
            { label: 'Buses', href: '/dashboard/buses', icon: Bus },
            { label: 'Routes', href: '/dashboard/routes', icon: Route },
            { label: 'Schedules', href: '/dashboard/schedules', icon: CalendarClock },
            { label: 'Bookings', href: '/dashboard/bookings', icon: Ticket },
            { label: 'Payments', href: '/dashboard/payments', icon: CreditCard },
            { label: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
        ],
    },
    {
        label: 'Services',
        items: [
            { label: 'Bus Services', href: '/dashboard/content/bus-services', icon: Bus },
            { label: 'Tour Packages', href: '/dashboard/content/tour-packages', icon: Package },
            { label: 'Vehicle Rentals', href: '/dashboard/content/vehicle-rentals', icon: Car },
            { label: 'Destinations', href: '/dashboard/content/destinations', icon: MapPin },
            { label: 'Stories', href: '/dashboard/content/stories', icon: Film },
        ],
    },
    {
        label: 'Site Management',
        items: [
            { label: 'Sliders', href: '/dashboard/content/sliders', icon: SlidersHorizontal },
            { label: 'Hero Banners', href: '/dashboard/content/hero-banners', icon: Megaphone },
            { label: 'Features', href: '/dashboard/content/features', icon: Star },
            { label: 'Adventure Activities', href: '/dashboard/content/adventure-activities', icon: Tent },
            { label: 'Blogs', href: '/dashboard/content/blogs', icon: BookOpen },
            { label: 'Blog Authors', href: '/dashboard/content/blog-authors', icon: PenTool },
            { label: 'FAQs', href: '/dashboard/content/faqs', icon: HelpCircle },
            { label: 'Team Members', href: '/dashboard/content/team', icon: UserCheck },
            { label: 'Achievements', href: '/dashboard/content/achievements', icon: Trophy },
            { label: 'Gallery', href: '/dashboard/content/gallery', icon: ImageIcon },
            { label: 'Testimonials', href: '/dashboard/content/testimonials', icon: MessageSquare },
            { label: 'Email Subscribers', href: '/dashboard/content/email-subscribers', icon: Mail },
        ],
    },
    {
        label: 'Settings',
        items: [
            { label: 'About Us', href: '/dashboard/content/about', icon: Info },
            { label: 'Contact Info', href: '/dashboard/content/contact', icon: Phone },
            { label: 'Site Settings', href: '/dashboard/content/site-settings', icon: Globe },
            { label: 'Locations', href: '/dashboard/content/locations', icon: MapPin },
            { label: 'Users', href: '/dashboard/users', icon: Users },
            { label: 'CMS Pages', href: '/dashboard/cms', icon: FileText },
            { label: 'Media', href: '/dashboard/media', icon: Image },
            { label: 'Plugins', href: '/dashboard/plugins', icon: Plug },
        ],
    },
];


export default function Sidebar() {
    const pathname = usePathname();
    const { sidebarOpen, toggleSidebar, darkMode, toggleDarkMode, user, logout } = useStore();

    return (
        <aside
            className={`fixed left-0 top-0 z-40 h-screen bg-sidebar-light dark:bg-sidebar-dark transition-all duration-300 flex flex-col shadow-materio dark:shadow-materio-dark
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
                {navGroups.map((group) => (
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
                                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 group mb-1 ${isActive
                                        ? 'bg-gradient-to-r from-brand-600 to-brand-500 text-white shadow-md shadow-brand-500/40'
                                        : 'text-materio-textLight dark:text-materio-textDark hover:bg-sidebar-hoverLight dark:hover:bg-sidebar-hoverDark hover:text-brand-600 dark:hover:text-white'
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
            <div className="p-4 space-y-2">
                <button
                    onClick={toggleDarkMode}
                    className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-materio-textLight dark:text-materio-textDark hover:bg-sidebar-hoverLight dark:hover:bg-sidebar-hoverDark text-sm transition-all group"
                >
                    {darkMode ? <Sun className="w-5 h-5 shrink-0 text-amber-500" /> : <Moon className="w-5 h-5 shrink-0 text-indigo-500" />}
                    {sidebarOpen && <span className="group-hover:text-brand-600 dark:group-hover:text-white">{darkMode ? 'Light Mode' : 'Dark Mode'}</span>}
                </button>

                {user && sidebarOpen && (
                    <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-sidebar-hoverLight dark:bg-sidebar-hoverDark border border-gray-100 dark:border-gray-800">
                        <div className="w-8 h-8 bg-brand-500 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-sm shadow-brand-500/30">
                            {user.firstName[0]}{user.lastName[0]}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-gray-900 dark:text-white text-xs font-semibold truncate">{user.firstName} {user.lastName}</p>
                            <p className="text-gray-500 dark:text-gray-400 text-[10px] truncate capitalize">{user.role.replace('_', ' ')}</p>
                        </div>
                        <button onClick={logout} className="text-gray-400 hover:text-red-500 transition-colors">
                            <LogOut className="w-4 h-4" />
                        </button>
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
