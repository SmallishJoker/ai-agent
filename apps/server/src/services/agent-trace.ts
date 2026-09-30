import { createRunId } from '../utils/run-id.js'

import {
    createAgentRun,
    createAgentStep,
    finishAgentRun,
    findAgentTrace
} from '../repositories/agent-trace.repository.js'

export async function startAgentRun(data: {
    userId: string
    conversationId: string
}) {
    const runId = createRunId()

    await createAgentRun({
        runId,
        userId: data.userId,
        conversationId: data.conversationId
    })

    return runId
}

export async function recordAgentStep(data: {
    runId: string
    stepIndex: number
    type: string
    name?: string
    startedAt: Date
    finishedAt?: Date
    durationMs?: number
    input?: unknown
    output?: unknown
    error?: string
}) {
    return createAgentStep(data)
}

export async function completeAgentRun(
    runId: string,
    data: {
        status: 'completed' | 'failed'
        finishReason?: string
        durationMs?: number
        inputTokens?: number
        outputTokens?: number
        totalTokens?: number
        error?: string
    }
) {
    return finishAgentRun(runId, data)
}

export async function getAgentTrace(runId: string) {
    return findAgentTrace(runId)
}