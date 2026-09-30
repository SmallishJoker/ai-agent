import type {
    AgentStep,
    AgentTrace,
    AgentUsage
} from './types.js'

export function createAgentTrace(data: {
    runId: string
    userId: string
    conversationId: string
}) {
    const trace: AgentTrace = {
        runId: data.runId,

        userId: data.userId,

        conversationId:
            data.conversationId,

        startedAt: Date.now(),

        steps: []
    }

    return trace
}

export function addAgentStep(
    trace: AgentTrace,
    step: AgentStep
) {
    trace.steps.push(step)
}

export function finishAgentTrace(
    trace: AgentTrace,
    data: {
        finishReason?: AgentTrace['finishReason']
        usage?: AgentUsage
        error?: string
    }
) {
    trace.finishedAt = Date.now()

    trace.finishReason = data.finishReason

    trace.usage = data.usage

    trace.error = data.error

    return trace
}
