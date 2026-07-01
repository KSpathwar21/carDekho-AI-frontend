import { useState } from 'react'
import type { FormEvent } from 'react'
import { FaPaperPlane } from 'react-icons/fa'

const MAX_LENGTH = 500

interface ChatInputProps {
  onSend: (message: string) => void
  disabled?: boolean
}

function ChatInput({ onSend, disabled = false }: ChatInputProps) {
  const [value, setValue] = useState('')

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    const trimmed = value.trim()
    if (!trimmed || disabled) return
    onSend(trimmed)
    setValue('')
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2 border-t border-gray-100 bg-white p-4">
      <input
        type="text"
        value={value}
        onChange={(event) => setValue(event.target.value.slice(0, MAX_LENGTH))}
        disabled={disabled}
        autoFocus
        maxLength={MAX_LENGTH}
        placeholder="Type your reply..."
        className="flex-1 rounded-full border border-gray-200 px-4 py-2.5 text-sm text-gray-900 outline-none focus:border-[#2563eb] disabled:bg-gray-50 disabled:text-gray-400"
      />
      <button
        type="submit"
        disabled={disabled || !value.trim()}
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#2563eb] text-white disabled:opacity-40"
      >
        <FaPaperPlane size={14} />
      </button>
    </form>
  )
}

export default ChatInput
