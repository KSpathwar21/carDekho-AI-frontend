import { BODY_TYPE_OPTIONS, FUEL_TYPE_OPTIONS, TRANSMISSION_OPTIONS } from '../constants/quickReplies'
import type { QuickReplyOption } from '../constants/quickReplies'

// The backend doesn't tag which preference field its question targets, so
// this is a best-effort keyword match on the assistant's free-text
// question — not a substitute for the real field. If it misses, the user
// just types a free-text reply instead, same as always.
export function detectQuickReplyOptions(assistantMessage: string): QuickReplyOption[] | null {
  const lower = assistantMessage.toLowerCase()

  if (lower.includes('fuel')) return FUEL_TYPE_OPTIONS
  if (lower.includes('transmission') || lower.includes('manual or automatic')) return TRANSMISSION_OPTIONS
  if (lower.includes('body type')) return BODY_TYPE_OPTIONS

  return null
}
