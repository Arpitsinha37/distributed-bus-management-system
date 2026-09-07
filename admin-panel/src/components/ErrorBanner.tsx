import { XCircle } from 'lucide-react';

interface ErrorBannerProps {
  message: string | null;
}

export default function ErrorBanner({ message }: ErrorBannerProps) {
  if (!message) return null;
  return (
    <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-center gap-3 text-red-600 dark:text-red-400">
      <XCircle className="w-5 h-5 shrink-0" />
      <div>
        <h3 className="font-bold text-sm">Failed to load</h3>
        <p className="text-xs mt-0.5">{message}</p>
      </div>
    </div>
  );
}
