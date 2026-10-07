import type { UIMessage } from 'ai'

import {
    createConversation,
    getConversation,
    getMessages,
    saveMessages,
    getAllConversations,
    updateConversationTitleIfDefault
} from '../repositories/conversation.repository.js'

import {
    databaseMessageToUIMessage,
    uiMessageToDatabase
} from './message-mapper.js'

export async function createNewConversation(
    title: string,
    userId: string
) {
    return createConversation(title, userId)
}

export async function conversationExists(
    conversationId: string,
    userId: string
) {
    const conversation = await getConversation(
        conversationId,
        userId
    )

    return Boolean(conversation)
}

export async function loadConversation(
    conversationId: string,
    userId: string
) {
    const conversation = await getConversation(
        conversationId,
        userId
    )

    if (!conversation) {
        throw new Error('Conversation not found')
    }

    const rows = await getMessages(conversationId)

    return {
        conversation,
        messages: rows.map(databaseMessageToUIMessage)
    }
}

export const DEFAULT_CONVERSATION_TITLE = '新对话'

const MAX_TITLE_LENGTH = 30

export function getFirstUserText(
    messages: UIMessage[]
) {
    const message = messages.find(
        item => item.role === 'user'
    )

    if (!message) {
        return ''
    }

    return message.parts
        .filter(part => part.type === 'text')
        .map(part => part.text)
        .join('')
        .trim()
}

function buildConversationTitle(text: string) {
    const normalized = text
        .replace(/\s+/g, ' ')
        .trim()

    if (normalized.length <= MAX_TITLE_LENGTH) {
        return normalized
    }

    return `${normalized.slice(0, MAX_TITLE_LENGTH)}…`
}

export async function persistMessages(
    conversationId: string,
    messages: UIMessage[]
) {
    await saveMessages(
        conversationId,
        messages.map(uiMessageToDatabase)
    )

    const firstUserText = getFirstUserText(messages)

    if (!firstUserText) {
        return
    }

    try {
        await updateConversationTitleIfDefault(
            conversationId,
            buildConversationTitle(firstUserText),
            DEFAULT_CONVERSATION_TITLE
        )
    } catch (titleError) {
        console.error(
            'Failed to update conversation title',
            titleError
        )
    }
}

export async function loadAllConversations(
    userId: string
) {
    const conversations = await getAllConversations(
        userId
    )

    return conversations
}
