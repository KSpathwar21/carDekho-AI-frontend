import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useConversation } from '../hooks/useConversation'
import ChatWindow from '../components/Chat/ChatWindow'
import ChatInput from '../components/Chat/ChatInput'
import ThinkingAnimation from '../components/Chat/ThinkingAnimation'
import QuickReplyChips from '../components/Chat/QuickReplyChips'
import ErrorBanner from '../components/Common/ErrorBanner'
import { detectQuickReplyOptions } from '../utils/detectQuickReplyOptions'

function Chat() {
  const { conversationId, messages, loading, error, completed, canRetry, start, send, retry } = useConversation()
  const navigate = useNavigate()

  useEffect(() => {
    if (!conversationId && !loading && !error) {
      void start()
    }
  }, [conversationId, loading, error, start])

  useEffect(() => {
    if (completed) {
      navigate('/recommendation')
    }
  }, [completed, navigate])

  const lastAssistantMessage = [...messages].reverse().find((message) => message.role === 'assistant')
  const quickReplyOptions =
    !loading && !completed && lastAssistantMessage ? detectQuickReplyOptions(lastAssistantMessage.text) : null

  return (
    <div className="mx-auto flex h-full w-full max-w-3xl flex-col">
      <ChatWindow
        messages={messages}
        footer={
          loading ? (
            <ThinkingAnimation />
          ) : quickReplyOptions ? (
            <QuickReplyChips options={quickReplyOptions} onSelect={send} />
          ) : undefined
        }
      />
      {error && (
        <div className="px-4 pb-2">
          <ErrorBanner error={error} onRetry={canRetry ? retry : undefined} />
        </div>
      )}
      <ChatInput onSend={send} disabled={loading || !conversationId} />
    </div>
  )
}

export default Chat
