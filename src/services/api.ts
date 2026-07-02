import axios from 'axios'
import type { ChatRequest, ChatResponse, ConversationResponse } from '../types/chat'
import type { CarResponse } from '../types/car'
import type { Page } from '../types/page'
import type { ErrorResponse } from '../types/error'

const client = axios.create({ baseURL: import.meta.env.VITE_API_BASE_URL })

function toErrorResponse(error: unknown): ErrorResponse {
  if (axios.isAxiosError(error) && error.response?.data) {
    return error.response.data as ErrorResponse
  }
  return {
    timestamp: new Date().toISOString(),
    status: 0,
    error: 'Network Error',
    message: 'Could not reach the server. Check your connection and try again.',
    path: '',
  }
}

export async function startConversation(): Promise<ConversationResponse> {
  try {
    const { data } = await client.post<ConversationResponse>('/chat/start')
    return data
  } catch (error) {
    throw toErrorResponse(error)
  }
}

export async function sendMessage(request: ChatRequest): Promise<ChatResponse> {
  try {
    const { data } = await client.post<ChatResponse>('/chat/message', request)
    return data
  } catch (error) {
    throw toErrorResponse(error)
  }
}

export async function getCars(page = 0, size = 20, sort?: string): Promise<Page<CarResponse>> {
  try {
    const { data } = await client.get<Page<CarResponse>>('/cars', {
      params: { page, size, ...(sort ? { sort } : {}) },
    })
    return data
  } catch (error) {
    throw toErrorResponse(error)
  }
}

export async function getCar(id: number): Promise<CarResponse> {
  try {
    const { data } = await client.get<CarResponse>(`/cars/${id}`)
    return data
  } catch (error) {
    throw toErrorResponse(error)
  }
}
