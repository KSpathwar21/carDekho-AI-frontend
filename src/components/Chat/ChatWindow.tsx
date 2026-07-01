import { useEffect, useRef } from 'react'
import type { ReactNode } from 'react'
import type { ChatMessage } from '../../types/chat'
import MessageBubble from './MessageBubble'

interface ChatWindowProps {
  messages: ChatMessage[]
  footer?: ReactNode
}

function ChatWindow({ messages, footer }: ChatWindowProps) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, footer])

  return (
    <div className="flex-1 space-y-4 overflow-y-auto px-4 py-6">
      {messages.map((message) => (
        <MessageBubble key={message.id} message={message} />
      ))}
      {footer}
      <div ref={bottomRef} />
    </div>
  )
}

export default ChatWindow
