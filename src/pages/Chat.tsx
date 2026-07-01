import { useState } from 'react'
import type { ChatMessage } from '../types/chat'
import ChatWindow from '../components/Chat/ChatWindow'
import ChatInput from '../components/Chat/ChatInput'
import ThinkingAnimation from '../components/Chat/ThinkingAnimation'
import QuickReplyChips from '../components/Chat/QuickReplyChips'
import ProgressIndicator from '../components/Common/ProgressIndicator'
import { FUEL_TYPE_OPTIONS } from '../constants/quickReplies'

// Static mock conversation to validate the Chat screen's layout/interaction
// ahead of M6, which replaces this local state with the real useChat hook
// wired to POST /chat/start and /chat/message.
const MOCK_ASSISTANT_TURNS = [
  "Hi! I'm your AI Car Buying Assistant. I'll ask a few questions to recommend the perfect car. What's your budget?",
  'Got it. What fuel type do you prefer?',
  'Great choice. What body type are you looking for — SUV, Sedan, Hatchback or MUV?',
  'Noted. Do you prefer manual or automatic transmission?',
  "This is a static preview — real answers will be wired up in M6's API integration.",
]

let idCounter = 0
const nextId = () => `mock-${idCounter++}`

function Chat() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: nextId(), role: 'assistant', text: MOCK_ASSISTANT_TURNS[0] },
  ])
  const [turn, setTurn] = useState(0)
  const [loading, setLoading] = useState(false)

  const handleSend = (text: string) => {
    setMessages((prev) => [...prev, { id: nextId(), role: 'user', text }])
    setLoading(true)

    setTimeout(() => {
      const nextTurn = Math.min(turn + 1, MOCK_ASSISTANT_TURNS.length - 1)
      setMessages((prev) => [
        ...prev,
        { id: nextId(), role: 'assistant', text: MOCK_ASSISTANT_TURNS[nextTurn] },
      ])
      setTurn(nextTurn)
      setLoading(false)
    }, 1200)
  }

  const showFuelChips = turn === 1 && !loading

  return (
    <div className="mx-auto flex h-full w-full max-w-3xl flex-col">
      <ProgressIndicator current={turn + 1} total={MOCK_ASSISTANT_TURNS.length} />
      <ChatWindow
        messages={messages}
        footer={
          loading ? (
            <ThinkingAnimation />
          ) : showFuelChips ? (
            <QuickReplyChips options={FUEL_TYPE_OPTIONS} onSelect={handleSend} />
          ) : undefined
        }
      />
      <ChatInput onSend={handleSend} disabled={loading} />
    </div>
  )
}

export default Chat
