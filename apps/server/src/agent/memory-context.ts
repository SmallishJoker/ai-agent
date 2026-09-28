import { memoryConfig } from '../config/memory.js'

import {
    getRecentMessages
} from '../repositories/conversation.repository.js'

import { getConversationSummary } from '../services/memory.js'

import { getUserMemories } from '../services/user-memory.js'

export async function buildMemoryContext(
    conversationId: string,
    userId: string
) {
    const [summary, recentMessages, userMemories] =
        await Promise.all([
            getConversationSummary(
                conversationId
            ),
            getRecentMessages(
                conversationId,
                memoryConfig.recentMessageLimit
            ),
            getUserMemories(
                userId
            )
        ])

    return {
        summary,
        recentMessages,
        userMemories
    }
}
