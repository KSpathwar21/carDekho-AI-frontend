import ReactMarkdown from 'react-markdown'
import { FaCarSide } from 'react-icons/fa'
import type { ChatMessage } from '../../types/chat'

interface MessageBubbleProps {
  message: ChatMessage
}

function MessageBubble({ message }: MessageBubbleProps) {
  const isAssistant = message.role === 'assistant'

  return (
    <div className={`flex items-start gap-3 ${isAssistant ? '' : 'flex-row-reverse'}`}>
      {isAssistant && (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#2563eb] text-white">
          <FaCarSide size={14} />
        </div>
      )}
      <div
        className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
          isAssistant ? 'bg-[#eff6ff] text-gray-900' : 'bg-gray-100 text-gray-900'
        }`}
      >
        <ReactMarkdown
          components={{
            p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
          }}
        >
          {message.text}
        </ReactMarkdown>
      </div>
    </div>
  )
}

export default MessageBubble
