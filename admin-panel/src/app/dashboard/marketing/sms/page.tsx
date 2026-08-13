'use client';
import { MessageSquare } from 'lucide-react';

export default function GlobalSmsPage() {
    return (
        <div className="bg-white dark:bg-gray-900 rounded-xl p-8 border border-gray-200 dark:border-gray-800 text-center">
            <div className="w-16 h-16 bg-brand-100 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Marketing SMS & Notifications</h2>
            <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                Configure global SMS gateways, bulk marketing campaigns, and transactional SMS templates for your fleet. (Coming Soon)
            </p>
        </div>
    );
}
