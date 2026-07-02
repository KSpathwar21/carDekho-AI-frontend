import type { CarResponse } from './car'

export type ChatRole = 'user' | 'assistant'

export interface ChatMessage {
  id: string
  role: ChatRole
  text: string
}

export interface ConversationResponse {
  conversationId: string
  assistantMessage: string
}

export interface ChatRequest {
  conversationId: string
  message: string
}

export interface ChatResponse {
  assistantMessage: string
  // Absent (not null) until completed: true — non_null Jackson serialization.
  recommendations?: CarResponse[]
  comparison?: CarResponse[]
  completed: boolean
}
