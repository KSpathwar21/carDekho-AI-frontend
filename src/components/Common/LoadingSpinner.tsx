interface LoadingSpinnerProps {
  size?: number
}

function LoadingSpinner({ size = 32 }: LoadingSpinnerProps) {
  return (
    <div
      className="animate-spin rounded-full border-4 border-gray-200 border-t-[#2563eb]"
      style={{ width: size, height: size }}
      role="status"
      aria-label="Loading"
    />
  )
}

export default LoadingSpinner
