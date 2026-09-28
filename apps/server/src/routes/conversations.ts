import type { FastifyPluginAsync } from 'fastify'

import {
    createConversationSchema,
    userIdQuerySchema
} from '../schemas/conversation.js'

import {
    createNewConversation,
    loadAllConversations,
    loadConversation
} from '../services/conversation.js'

export const conversationRoutes: FastifyPluginAsync =
    async app => {
        app.get(
            '/api/getAllConversations',
            async (request, reply) => {
                const parsed =
                    userIdQuerySchema.safeParse(
                        request.query
                    )

                if (!parsed.success) {
                    return reply.status(400).send({
                        success: false,
                        message: 'userId is required'
                    })
                }

                try {
                    const conversations =
                        await loadAllConversations(
                            parsed.data.userId
                        )

                    return reply.send({
                        success: true,
                        conversations
                    })
                } catch (error) {
                    request.log.error(error)

                    return reply.status(500).send({
                        success: false,
                        message:
                            error instanceof Error
                                ? error.message
                                : 'Failed to load conversations'
                    })
                }
            }
        )

        app.post(
            '/api/conversations',
            async (request, reply) => {
                const parsed =
                    createConversationSchema.safeParse(
                        request.body ?? {}
                    )

                if (!parsed.success) {
                    return reply.status(400).send({
                        success: false,
                        message: 'Invalid request body'
                    })
                }

                const conversation =
                    await createNewConversation(
                        parsed.data.title ?? '新对话',
                        parsed.data.userId
                    )

                return reply.send({
                    success: true,
                    conversation
                })
            }
        )

        app.get(
            '/api/conversations/:id/messages',
            async (request, reply) => {
                const { id } = request.params as {
                    id: string
                }

                const parsed =
                    userIdQuerySchema.safeParse(
                        request.query
                    )

                if (!parsed.success) {
                    return reply.status(400).send({
                        success: false,
                        message: 'userId is required'
                    })
                }

                try {
                    const result =
                        await loadConversation(
                            id,
                            parsed.data.userId
                        )

                    return reply.send({
                        success: true,
                        ...result
                    })
                } catch {
                    return reply.status(404).send({
                        success: false,
                        message: 'Conversation not found'
                    })
                }
            }
        )
    }
