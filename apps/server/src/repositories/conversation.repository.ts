import { and, asc, count, desc, eq, sql } from 'drizzle-orm'
import { db } from '../db/index.js'
import {
    conversations,
    messages
} from '../db/schema.js'

export async function createConversation(
    title: string,
    userId: string
) {
    const id = crypto.randomUUID()

    const [conversation] = await db
        .insert(conversations)
        .values({
            id,
            userId,
            title
        })
        .returning()

    return conversation
}

export async function getAllConversations(
    userId: string
) {
    return db
        .select()
        .from(conversations)
        .where(eq(conversations.userId, userId))
        .orderBy(desc(conversations.updatedAt))
}

export async function getConversation(
    conversationId: string,
    userId: string
) {
    const [conversation] = await db
        .select()
        .from(conversations)
        .where(
            and(
                eq(conversations.id, conversationId),
                eq(conversations.userId, userId)
            )
        )

    return conversation
}

export async function getMessages(
    conversationId: string
) {
    return db
        .select()
        .from(messages)
        .where(
            eq(messages.conversationId, conversationId)
        )
        .orderBy(
            asc(messages.seq)
        )
}

export async function getRecentMessages(
    conversationId: string,
    limit: number
) {
    if (limit <= 0) {
        return []
    }

    const rows = await db
        .select()
        .from(messages)
        .where(
            eq(messages.conversationId, conversationId)
        )
        .orderBy(desc(messages.seq))
        .limit(limit)

    return rows.reverse()
}

export async function getMessageCount(
    conversationId: string
) {
    const [row] = await db
        .select({ value: count() })
        .from(messages)
        .where(
            eq(messages.conversationId, conversationId)
        )

    return row?.value ?? 0
}

export async function getMessagesRange(
    conversationId: string,
    offset: number,
    limit: number
) {
    if (limit <= 0) {
        return []
    }

    return db
        .select()
        .from(messages)
        .where(
            eq(messages.conversationId, conversationId)
        )
        .orderBy(asc(messages.seq))
        .offset(offset)
        .limit(limit)
}

export async function saveMessages(
    conversationId: string,
    items: Array<{
        id: string
        role: string
        content?: string | null
        parts?: unknown
    }>
) {
    if (items.length === 0) {
        return
    }

    await db
        .insert(messages)
        .values(
            items.map(item => ({
                id: item.id,
                conversationId,
                role: item.role,
                content: item.content ?? null,
                parts: item.parts ?? null
            }))
        )
        .onConflictDoUpdate({
            target: messages.id,
            set: {
                role: sql`excluded.role`,
                content: sql`excluded.content`,
                parts: sql`excluded.parts`
            }
        })

    await db
        .update(conversations)
        .set({ updatedAt: new Date() })
        .where(eq(conversations.id, conversationId))
}