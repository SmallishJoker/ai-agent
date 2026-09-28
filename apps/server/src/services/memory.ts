import { memoryConfig } from '../config/memory.js'

import {
    getMessageCount,
    getMessagesRange
} from '../repositories/conversation.repository.js'

import {
    createConversationSummary,
    getLatestConversationSummary
} from '../repositories/memory.repository.js'

import { generateConversationSummary } from '../agent/summarizer.js'

import {
    databaseMessageToUIMessage,
    type DatabaseMessage
} from './message-mapper.js'

export interface SummaryBoundaryInput {
    total: number
    summarizedCount: number
    recentLimit: number
    batchSize: number
}

export function computeSummaryBoundary({
    total,
    summarizedCount,
    recentLimit,
    batchSize
}: SummaryBoundaryInput): number | null {
    const boundary = total - recentLimit

    if (boundary - summarizedCount < batchSize) {
        return null
    }

    return boundary
}

function renderMessage(row: DatabaseMessage) {
    const message = databaseMessageToUIMessage(row)

    const text = message.parts
        .filter(part => part.type === 'text')
        .map(part => part.text)
        .join('')
        .trim()

    return `${message.role}: ${
        text.length > 0 ? text : '[非文本内容]'
    }`
}

export async function createConvSummary(
    conversationId: string,
    summary: string,
    summarizedCount: number
) {
    return createConversationSummary(
        conversationId,
        summary,
        summarizedCount
    )
}

export async function getConversationSummary(
    conversationId: string
) {
    const latest =
        await getLatestConversationSummary(
            conversationId
        )

    return latest?.summary ?? null
}

export async function updateConversationMemory(
    conversationId: string
) {
    const [total, latest] = await Promise.all([
        getMessageCount(conversationId),
        getLatestConversationSummary(
            conversationId
        )
    ])

    const summarizedCount =
        latest?.summarizedCount ?? 0

    const boundary = computeSummaryBoundary({
        total,
        summarizedCount,
        recentLimit: memoryConfig.recentMessageLimit,
        batchSize: memoryConfig.summaryBatchSize
    })

    if (boundary === null) {
        return null
    }

    const rows = await getMessagesRange(
        conversationId,
        summarizedCount,
        boundary - summarizedCount
    )

    if (rows.length === 0) {
        return null
    }

    const transcript = rows
        .map(renderMessage)
        .join('\n')

    const summary =
        await generateConversationSummary({
            previousSummary:
                latest?.summary ?? null,
            transcript
        })

    return createConversationSummary(
        conversationId,
        summary,
        boundary
    )
}
