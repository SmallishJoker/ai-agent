import type { FastifyPluginAsync } from 'fastify'

import {
    createUIMessageStream,
    createUIMessageStreamResponse,
    toUIMessageStream,
    type UIMessage
} from 'ai'

import { chatRequestSchema } from '../schemas/chat.js'

import { logAgentTrace } from '../agent/trace-logger.js'

import { streamChat } from '../services/chat.js'

import {
    conversationExists,
    persistMessages
} from '../services/conversation.js'

import {
    completeAgentRun,
    recordAgentStep,
    startAgentRun
} from '../services/agent-trace.js'

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

            const stream = createUIMessageStream({
                originalMessages: messages,

                execute: async ({ writer }) => {
                    let runId: string | null = null

                    try {
                        runId = await startAgentRun({
                            userId,
                            conversationId
                        })

                        writer.write({
                            type: 'data-agentRun',
                            data: { runId }
                        })
                    } catch (runError) {
                        request.log.error(
                            runError,
                            'Failed to start agent run'
                        )
                    }

                    const result = await streamChat(
                        conversationId,
                        messages,
                        userId,
                        {
                            runId: runId ?? undefined,

                            onStep: step => {
                                const {
                                    input,
                                    output,
                                    ...streamStep
                                } = step

                                request.log.info(
                                    { agentStep: streamStep },
                                    'agent step'
                                )

                                writer.write({
                                    type: 'data-agentStep',
                                    data: streamStep,
                                    transient: true
                                })

                                if (!runId) {
                                    return
                                }

                                void recordAgentStep({
                                    runId,
                                    stepIndex: step.index,
                                    type: step.type,
                                    name: step.toolName,
                                    startedAt: new Date(
                                        step.startedAt
                                    ),
                                    finishedAt:
                                        step.finishedAt !==
                                            undefined
                                            ? new Date(
                                                step.finishedAt
                                            )
                                            : undefined,
                                    durationMs:
                                        step.durationMs,
                                    input,
                                    output,
                                    error: step.error
                                }).catch(stepError => {
                                    request.log.error(
                                        stepError,
                                        'Failed to record agent step'
                                    )
                                })
                            },

                            onTrace: trace => {
                                logAgentTrace(
                                    trace,
                                    (payload, message) =>
                                        request.log.info(
                                            payload,
                                            message
                                        )
                                )

                                if (!runId) {
                                    return
                                }

                                void completeAgentRun(
                                    runId,
                                    {
                                        status: trace.error
                                            ? 'failed'
                                            : 'completed',
                                        finishReason:
                                            trace.finishReason,
                                        durationMs:
                                            trace.finishedAt !==
                                                undefined
                                                ? trace.finishedAt -
                                                trace.startedAt
                                                : undefined,
                                        inputTokens:
                                            trace.usage
                                                ?.inputTokens,
                                        outputTokens:
                                            trace.usage
                                                ?.outputTokens,
                                        totalTokens:
                                            trace.usage
                                                ?.totalTokens,
                                        error: trace.error
                                    }
                                ).catch(runError => {
                                    request.log.error(
                                        runError,
                                        'Failed to complete agent run'
                                    )
                                })
                            }
                        }
                    )

                    writer.merge(
                        toUIMessageStream({
                            stream: result.stream,
                            originalMessages: messages,
                            generateMessageId: () =>
                                crypto.randomUUID()
                        })
                    )
                },

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

            const response =
                createUIMessageStreamResponse({
                    stream
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
