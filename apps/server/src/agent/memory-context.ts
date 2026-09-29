import { memoryConfig } from '../config/memory.js'

import {
    getRecentMessages
} from '../repositories/conversation.repository.js'

import { getConversationSummary } from '../services/memory.js'

import { getUserMemories } from '../services/user-memory.js'

import { searchRelevantMemories } from '../services/semantic-memory.js'

export async function buildMemoryContext(
    conversationId: string,
    userId: string,
    currentUserMessage: string
) {
    const [summary, recentMessages, relevantMemories] =
        await Promise.all([
            getConversationSummary(
                conversationId
            ),
            getRecentMessages(
                conversationId,
                memoryConfig.recentMessageLimit
            ),
            currentUserMessage.trim().length > 0
                ? searchRelevantMemories(
                    userId,
                    currentUserMessage,
                    memoryConfig.semanticTopK
                )
                : Promise.resolve(null)
        ])

    const userMemories =
        relevantMemories ??
        (await getUserMemories(userId))

    return {
        summary,
        recentMessages,
        userMemories
    }
}
