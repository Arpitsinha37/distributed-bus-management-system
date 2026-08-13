'use client';

import Sidebar from '@/components/Sidebar';
import { useStore } from '@/lib/store';
import { Menu } from 'lucide-react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const sidebarOpen = useStore((s) => s.sidebarOpen);
    const toggleSidebar = useStore((s) => s.toggleSidebar);

    return (
        <div className="flex min-h-screen text-materio-textLight dark:text-materio-textDark">
            <Sidebar />
            <main
                className={`flex-1 transition-all duration-300 w-full ${sidebarOpen ? 'md:ml-[280px]' : 'md:ml-[92px]'
                    }`}
            >
                {/* Mobile Header */}
                <div className="md:hidden flex items-center justify-between p-4 border-b border-gray-200/50 dark:border-gray-800/50 bg-white/40 dark:bg-gray-900/40 backdrop-blur-xl shadow-sm sticky top-0 z-20">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center text-white font-bold shadow-md shadow-brand-500/40">C</div>
                        <span className="font-bold text-gray-900 dark:text-white">CMS</span>
                    </div>
                    <button onClick={toggleSidebar} className="p-2 text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 rounded-lg transition-colors">
                        <Menu className="w-6 h-6" />
                    </button>
                </div>

                <div className="p-4 md:p-6 lg:p-8">{children}</div>
            </main>

            {/* Mobile Overlay */}
            {sidebarOpen && (
                <div 
                    className="md:hidden fixed inset-0 bg-black/50 z-30" 
                    onClick={toggleSidebar}
                />
            )}
        </div>
    );
}
