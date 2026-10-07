import type { ChatUIMessage } from '@/types/chat'

type MessagePart = ChatUIMessage['parts'][number]

function isRecord(
  value: unknown
): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function normalizePart(
  part: Record<string, unknown>
): MessagePart | null {
  const { type } = part

  if (typeof type !== 'string' || type.length === 0) {
    return null
  }

  if (
    type === 'data-agentRun' ||
    type === 'data-agentStep'
  ) {
    return isRecord(part.data)
      ? (part as MessagePart)
      : null
  }

  if (type === 'text') {
    return {
      ...part,
      text: typeof part.text === 'string' ? part.text : ''
    } as MessagePart
  }

  if (type.startsWith('tool-')) {
    if (
      part.state === 'output-available' &&
      !isRecord(part.output)
    ) {
      return {
        ...part,
        state: 'output-error'
      } as MessagePart
    }

    return part as MessagePart
  }

  return part as MessagePart
}

export function sanitizeMessages(
  messages: unknown
): ChatUIMessage[] {
  if (!Array.isArray(messages)) {
    return []
  }

  return messages
    .filter(isRecord)
    .map((message, index) => {
      const rawParts = Array.isArray(message.parts)
        ? message.parts
        : []

      const parts = rawParts
        .filter(isRecord)
        .map(normalizePart)
        .filter(
          (part): part is MessagePart => part !== null
        )

      const role =
        message.role === 'user' ||
        message.role === 'assistant' ||
        message.role === 'system'
          ? message.role
          : 'assistant'

      const id =
        typeof message.id === 'string' &&
        message.id.length > 0
          ? message.id
          : `message-${index}`

      return {
        id,
        role,
        parts
      } as ChatUIMessage
    })
}
