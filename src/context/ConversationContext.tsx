import { useCallback, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import type { ChatMessage } from '../types/chat'
import type { CarResponse } from '../types/car'
import type { ErrorResponse } from '../types/error'
import { sendMessage as sendMessageRequest, startConversation as startConversationRequest } from '../services/api'
import { ConversationContext } from './conversation-context'
import type { ConversationContextValue } from './conversation-context'

let messageIdCounter = 0
const nextMessageId = () => `msg-${messageIdCounter++}`

// 503s are the backend's label for transient upstream failures (LLM/DB) —
// safe to resend the same request. Everything else (400/404/500) needs a
// different recovery action, handled explicitly below.
const RETRYABLE_ERRORS = new Set(['LLM Failure', 'Database Failure', 'Network Error'])

export function ConversationProvider({ children }: { children: ReactNode }) {
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [completed, setCompleted] = useState(false)
  const [recommendations, setRecommendations] = useState<CarResponse[]>([])
  const [comparison, setComparison] = useState<CarResponse[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<ErrorResponse | null>(null)
  const [pendingText, setPendingText] = useState<string | null>(null)

  const start = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await startConversationRequest()
      setConversationId(response.conversationId)
      setMessages([{ id: nextMessageId(), role: 'assistant', text: response.assistantMessage }])
      setCompleted(false)
      setRecommendations([])
      setComparison([])
      setPendingText(null)
    } catch (err) {
      setError(err as ErrorResponse)
    } finally {
      setLoading(false)
    }
  }, [])

  const send = useCallback(
    async (text: string) => {
      if (!conversationId) return
      setMessages((prev) => [...prev, { id: nextMessageId(), role: 'user', text }])
      setPendingText(text)
      setLoading(true)
      setError(null)
      try {
        const response = await sendMessageRequest({ conversationId, message: text })
        setMessages((prev) => [...prev, { id: nextMessageId(), role: 'assistant', text: response.assistantMessage }])
        setCompleted(response.completed)
        setRecommendations(response.recommendations ?? [])
        setComparison(response.comparison ?? [])
        setPendingText(null)
      } catch (err) {
        setError(err as ErrorResponse)
      } finally {
        setLoading(false)
      }
    },
    [conversationId],
  )

  const retry = useCallback(async () => {
    if (!error) return
    // Conversation never started, or the backend lost it (in-memory store,
    // e.g. a restart) — the only way forward is a fresh conversation.
    if (!conversationId || error.error === 'Not Found') {
      await start()
      return
    }
    if (pendingText) {
      await send(pendingText)
    }
  }, [error, conversationId, pendingText, start, send])

  const reset = useCallback(() => {
    setConversationId(null)
    setMessages([])
    setCompleted(false)
    setRecommendations([])
    setComparison([])
    setError(null)
    setPendingText(null)
  }, [])

  const canRetry =
    error !== null &&
    (!conversationId || error.error === 'Not Found' || (RETRYABLE_ERRORS.has(error.error) && pendingText !== null))

  const value = useMemo<ConversationContextValue>(
    () => ({
      conversationId,
      messages,
      completed,
      recommendations,
      comparison,
      loading,
      error,
      canRetry,
      start,
      send,
      retry,
      reset,
    }),
    [conversationId, messages, completed, recommendations, comparison, loading, error, canRetry, start, send, retry, reset],
  )

  return <ConversationContext.Provider value={value}>{children}</ConversationContext.Provider>
}
