import { createContext } from 'react'
import type { ChatMessage } from '../types/chat'
import type { CarResponse } from '../types/car'
import type { ErrorResponse } from '../types/error'

export interface ConversationContextValue {
  conversationId: string | null
  messages: ChatMessage[]
  completed: boolean
  recommendations: CarResponse[]
  comparison: CarResponse[]
  loading: boolean
  error: ErrorResponse | null
  canRetry: boolean
  start: () => Promise<void>
  send: (text: string) => Promise<void>
  retry: () => Promise<void>
  reset: () => void
}

export const ConversationContext = createContext<ConversationContextValue | null>(null)
