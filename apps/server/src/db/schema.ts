import {
    bigserial,
    index,
    integer,
    jsonb,
    pgTable,
    uuid,
    text,
    timestamp
} from 'drizzle-orm/pg-core'

export const conversations = pgTable('conversations', {
    id: text('id').primaryKey(),

    userId: text('user_id')
        .notNull()
        .default('demo-user'),

    title: text('title').notNull(),

    createdAt: timestamp('created_at')
        .defaultNow()
        .notNull(),

    updatedAt: timestamp('updated_at')
        .defaultNow()
        .notNull()
}, table => [
    index('conversations_user_id_idx')
        .on(table.userId)
])

export const messages = pgTable(
    'messages',
    {
        id: text('id').primaryKey(),

        seq: bigserial('seq', { mode: 'number' }),

        conversationId: text('conversation_id')
            .notNull()
            .references(() => conversations.id, {
                onDelete: 'cascade'
            }),

        role: text('role').notNull(),

        content: text('content'),

        parts: jsonb('parts'),

        createdAt: timestamp('created_at')
            .defaultNow()
            .notNull()
    },
    table => [
        index('messages_conversation_id_idx')
            .on(table.conversationId)
    ]
)

export const conversationSummaries =
    pgTable('conversation_summaries', {
        id: uuid('id')
            .defaultRandom()
            .primaryKey(),

        conversationId: text('conversation_id')
            .notNull()
            .references(() => conversations.id, {
                onDelete: 'cascade'
            }),

        summary: text('summary')
            .notNull(),

        summarizedCount: integer('summarized_count')
            .notNull()
            .default(0),

        createdAt: timestamp('created_at')
            .defaultNow()
            .notNull(),

        updatedAt: timestamp('updated_at')
            .defaultNow()
            .notNull()
    }, table => [
        index('conversation_summaries_conversation_id_idx')
            .on(table.conversationId)
    ])

export const userMemories = pgTable('user_memories', {
    id: uuid('id').defaultRandom().primaryKey(),

    userId: text('user_id').notNull(),

    content: text('content').notNull(),

    type: text('type').notNull().default('preference'),

    importance: integer('importance').notNull().default(1),

    createdAt: timestamp('created_at').defaultNow().notNull(),

    updatedAt: timestamp('updated_at').defaultNow().notNull()
})