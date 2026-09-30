import type { AgentTrace } from './types.js'

export type TraceLogFunction = (
    payload: Record<string, unknown>,
    message: string
) => void

export function logAgentTrace(
    trace: AgentTrace,
    log?: TraceLogFunction
) {
    const payload = {
        type: 'agent_trace',

        runId: trace.runId,

        userId: trace.userId,

        conversationId: trace.conversationId,

        startedAt: trace.startedAt,

        finishedAt: trace.finishedAt,

        finishReason: trace.finishReason,

        durationMs: trace.finishedAt
            ? trace.finishedAt - trace.startedAt
            : undefined,

        usage: trace.usage,

        steps: trace.steps,

        error: trace.error
    }

    if (log) {
        log(payload, 'agent trace')

        return
    }

    console.log(
        JSON.stringify(payload, null, 2)
    )
}
