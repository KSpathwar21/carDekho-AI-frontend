import type { ErrorResponse } from '../../types/error'

interface ErrorBannerProps {
  error: ErrorResponse
  onRetry?: () => void
}

function ErrorBanner({ error, onRetry }: ErrorBannerProps) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
      <span>{error.message || 'Something went wrong. Please try again.'}</span>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="shrink-0 rounded-full bg-red-600 px-3 py-1 text-xs font-medium text-white hover:bg-red-700"
        >
          Retry
        </button>
      )}
    </div>
  )
}

export default ErrorBanner
