import { and, desc, eq } from 'drizzle-orm'
import { db } from '../db/index.js'
import { conversationSummaries, userMemories } from '../db/schema.js'

export async function createConversationSummary(
    conversationId: string,
    summary: string,
    summarizedCount: number
) {
    const [row] = await db
        .insert(conversationSummaries)
        .values({
            conversationId,
            summary,
            summarizedCount
        })
        .returning()

    return row
}

export async function getLatestConversationSummary(
    conversationId: string
) {
    const [row] = await db
        .select()
        .from(conversationSummaries)
        .where(
            eq(
                conversationSummaries.conversationId,
                conversationId
            )
        )
        .orderBy(desc(conversationSummaries.createdAt))
        .limit(1)

    return row
}

export async function createUserMemory(data: {
    userId: string
    content: string
    type: string
    importance?: number
}) {
    const [memory] = await db
        .insert(userMemories)
        .values({
            userId: data.userId,
            content: data.content,
            type: data.type,
            importance: data.importance ?? 1
        })
        .returning()

    return memory
}

export async function findUserMemories(
    userId: string,
    limit = 20
) {
    return db
        .select()
        .from(userMemories)
        .where(eq(userMemories.userId, userId))
        .orderBy(
            desc(userMemories.importance),
            desc(userMemories.updatedAt)
        )
        .limit(limit)
}

export async function findUserMemoryByContent(
    userId: string,
    content: string
) {
    const [row] = await db
        .select()
        .from(userMemories)
        .where(
            and(
                eq(userMemories.userId, userId),
                eq(userMemories.content, content)
            )
        )
        .limit(1)

    return row
}

export async function updateUserMemory(
    id: string,
    data: {
        importance?: number
        content?: string
        type?: string
    }
) {
    const [row] = await db
        .update(userMemories)
        .set({
            ...(data.importance !== undefined
                ? { importance: data.importance }
                : {}),
            ...(data.content !== undefined
                ? { content: data.content }
                : {}),
            ...(data.type !== undefined
                ? { type: data.type }
                : {}),
            updatedAt: new Date()
        })
        .where(eq(userMemories.id, id))
        .returning()

    return row
}