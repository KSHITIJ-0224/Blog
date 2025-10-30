import Link from 'next/link';

export function ErrorMessage({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
      <div className="text-red-600 text-5xl mb-4">⚠️</div>
      <h3 className="text-xl font-bold text-red-900 mb-2">Something went wrong</h3>
      <p className="text-red-700 mb-6">{message}</p>
      <div className="flex gap-4 justify-center">
        {onRetry && (
          <button
            onClick={onRetry}
            className="px-6 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition"
          >
            Try Again
          </button>
        )}
        <Link
          href="/"
          className="px-6 py-2 bg-white text-red-600 border border-red-600 rounded-lg font-medium hover:bg-red-50 transition"
        >
          Go Home
        </Link>
      </div>
    </div>
  );
}

export function EmptyState({
  title,
  description,
  actionLabel,
  actionHref,
}: {
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
}) {
  return (
    <div className="text-center py-12 bg-white rounded-lg">
      <div className="text-gray-400 text-6xl mb-4">📭</div>
      <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-500 mb-6">{description}</p>
      {actionLabel && actionHref && (
        <Link
          href={actionHref}
          className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
        >
          {actionLabel}
        </Link>
      )}
    </div>
  );
}
