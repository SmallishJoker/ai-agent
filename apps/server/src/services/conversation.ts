import type { UIMessage } from 'ai'

import {
    createConversation,
    getConversation,
    getMessages,
    saveMessages,
    getAllConversations
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

export async function persistMessages(
    conversationId: string,
    messages: UIMessage[]
) {
    await saveMessages(
        conversationId,
        messages.map(uiMessageToDatabase)
    )
}

export async function loadAllConversations(
    userId: string
) {
    const conversations = await getAllConversations(
        userId
    )

    return conversations
}
