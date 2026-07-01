interface ProgressIndicatorProps {
  current: number
  total: number
}

function ProgressIndicator({ current, total }: ProgressIndicatorProps) {
  const percent = Math.min(100, Math.round((current / total) * 100))

  return (
    <div className="px-4 py-3">
      <span className="text-xs text-gray-500">
        Question {current} of {total}
      </span>
      <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
        <div
          className="h-full rounded-full bg-[#2563eb] transition-all duration-500"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  )
}

export default ProgressIndicator
