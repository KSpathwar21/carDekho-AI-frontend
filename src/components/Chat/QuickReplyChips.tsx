import type { QuickReplyOption } from '../../constants/quickReplies'

interface QuickReplyChipsProps {
  options: QuickReplyOption[]
  onSelect: (message: string) => void
}

function QuickReplyChips({ options, onSelect }: QuickReplyChipsProps) {
  return (
    <div className="flex flex-wrap gap-2 pl-11">
      {options.map((option) => (
        <button
          key={option.label}
          type="button"
          onClick={() => onSelect(option.message)}
          className="rounded-full border border-[#2563eb] px-4 py-1.5 text-sm text-[#2563eb] hover:bg-[#eff6ff]"
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}

export default QuickReplyChips
