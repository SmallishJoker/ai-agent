import type { UIMessage } from 'ai'

export interface DatabaseMessage {
    id: string
    role: string
    content: string | null
    parts: unknown
}

export function databaseMessageToUIMessage(
    message: DatabaseMessage
): UIMessage {
    if (Array.isArray(message.parts)) {
        return {
            id: message.id,
            role: message.role as UIMessage['role'],
            parts: message.parts as UIMessage['parts']
        }
    }

    return {
        id: message.id,
        role: message.role as UIMessage['role'],
        parts: message.content
            ? [
                {
                    type: 'text',
                    text: message.content
                }
            ]
            : []
    }
}

export function uiMessageToDatabase(message: UIMessage) {
    const content = message.parts
        .filter(part => part.type === 'text')
        .map(part => part.text)
        .join('')

    return {
        id: message.id,
        role: message.role,
        content: content.length > 0 ? content : null,
        parts: message.parts
    }
}
