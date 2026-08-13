'use client';
import { Mail } from 'lucide-react';

export default function GlobalEmailsPage() {
    return (
        <div className="bg-white dark:bg-gray-900 rounded-xl p-8 border border-gray-200 dark:border-gray-800 text-center">
            <div className="w-16 h-16 bg-brand-100 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Global Email Templates</h2>
            <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                Manage global email templates for booking confirmations, ticket cancellations, and newsletters across all your storefronts. (Coming Soon)
            </p>
        </div>
    );
}
