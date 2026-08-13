'use client';

import { UserCheck } from 'lucide-react';

export default function StaffPage() {
    return (
        <div className="pb-10">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <UserCheck className="w-6 h-6 text-brand-500" /> Staff & Team Management
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">Manage drivers, conductors, and internal staff.</p>
                </div>
                <button className="px-4 py-2 bg-brand-500 text-white rounded-xl shadow-md shadow-brand-500/30 text-sm font-medium hover:bg-brand-600 transition-colors">
                    + Add Staff Member
                </button>
            </div>
            
            <div className="glass-card p-12 text-center text-gray-500 font-medium">
                Staff management is coming soon in the next update.
            </div>
        </div>
    );
}
