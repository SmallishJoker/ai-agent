import {
    bigserial,
    index,
    integer,
    jsonb,
    pgTable,
    uniqueIndex,
    uuid,
    text,
    timestamp
} from 'drizzle-orm/pg-core'

import { customType } from 'drizzle-orm/pg-core'

const vector = customType<{
    data: number[]
    driverData: string
}>({
    dataType() {
        return 'vector(1536)'
    },

    toDriver(value) {
        return `[${value.join(',')}]`
    },

    fromDriver(value) {
        return JSON.parse(
            `[${value.replace(/^\[|\]$/g, '')}]`
        )
    }
})

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

    embedding: vector('embedding'),

    createdAt: timestamp('created_at').defaultNow().notNull(),

    updatedAt: timestamp('updated_at').defaultNow().notNull()
}, table => [
    index('user_memories_user_id_idx')
        .on(table.userId),

    index('user_memories_embedding_idx')
        .using(
            'hnsw',
            table.embedding.op('vector_cosine_ops')
        )
])

export const agentRuns = pgTable('agent_runs', {
    id: uuid('id').defaultRandom().primaryKey(),

    // 给程序和前端使用的公开 Run ID
    runId: text('run_id').notNull().unique(),

    userId: text('user_id').notNull(),

    conversationId: text('conversation_id')
        .notNull()
        .references(() => conversations.id, {
            onDelete: 'cascade'
        }),

    status: text('status')
        .notNull()
        .default('running'),

    finishReason: text('finish_reason'),

    startedAt: timestamp('started_at')
        .defaultNow()
        .notNull(),

    finishedAt: timestamp('finished_at'),

    durationMs: integer('duration_ms'),

    inputTokens: integer('input_tokens'),

    outputTokens: integer('output_tokens'),

    totalTokens: integer('total_tokens'),

    error: text('error'),

    createdAt: timestamp('created_at')
        .defaultNow()
        .notNull()
})

export const agentSteps = pgTable('agent_steps', {
    id: uuid('id').defaultRandom().primaryKey(),

    runId: text('run_id')
        .notNull()
        .references(() => agentRuns.runId, {
            onDelete: 'cascade'
        }),

    stepIndex: integer('step_index').notNull(),

    type: text('type').notNull(),

    name: text('name'),

    startedAt: timestamp('started_at').notNull(),

    finishedAt: timestamp('finished_at'),

    durationMs: integer('duration_ms'),

    input: jsonb('input'),

    output: jsonb('output'),

    error: text('error'),

    createdAt: timestamp('created_at')
        .defaultNow()
        .notNull()
}, table => [
    uniqueIndex('agent_steps_run_id_step_index_idx')
        .on(table.runId, table.stepIndex)
])