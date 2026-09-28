import type { FastifyPluginAsync } from 'fastify'

import {
    createUIMessageStreamResponse,
    toUIMessageStream,
    type UIMessage
} from 'ai'

import { chatRequestSchema } from '../schemas/chat.js'

import { streamChat } from '../services/chat.js'

import {
    conversationExists,
    persistMessages
} from '../services/conversation.js'

import {
    updateConversationMemory
} from '../services/memory.js'

import {
    updateUserMemoryFromMessages
} from '../services/user-memory.js'

export const chatRoutes: FastifyPluginAsync = async app => {
    app.post('/api/chat', async (request, reply) => {
        const parsed = chatRequestSchema.safeParse(
            request.body
        )

        if (!parsed.success) {
            return reply.status(400).send({
                success: false,
                message: 'Invalid request body',
                issues: parsed.error.issues
            })
        }

        const { conversationId, userId } =
            parsed.data
        const messages =
            parsed.data.messages as UIMessage[]

        const exists = await conversationExists(
            conversationId,
            userId
        )

        if (!exists) {
            return reply.status(404).send({
                success: false,
                message: 'Conversation not found'
            })
        }

        try {
            await persistMessages(
                conversationId,
                messages
            )

            const result = await streamChat(
                conversationId,
                messages,
                userId
            )

            const response =
                createUIMessageStreamResponse({
                    stream: toUIMessageStream({
                        stream: result.stream,
                        originalMessages: messages,
                        generateMessageId: () =>
                            crypto.randomUUID(),
                        onEnd: async ({
                            messages: updatedMessages
                        }) => {
                            await persistMessages(
                                conversationId,
                                updatedMessages
                            )

                            void updateConversationMemory(
                                conversationId
                            ).catch(memoryError => {
                                request.log.error(
                                    memoryError,
                                    'Failed to update conversation memory'
                                )
                            })

                            void updateUserMemoryFromMessages(
                                userId,
                                updatedMessages
                            ).catch(memoryError => {
                                request.log.error(
                                    memoryError,
                                    'Failed to update user memory'
                                )
                            })
                        }
                    })
                })

            reply
                .status(response.status)
                .headers(
                    Object.fromEntries(
                        response.headers.entries()
                    )
                )

            return reply.send(response.body)
        } catch (error) {
            request.log.error(error)

            return reply.status(500).send({
                success: false,
                message:
                    error instanceof Error
                        ? error.message
                        : 'Chat failed'
            })
        }
    })
}
