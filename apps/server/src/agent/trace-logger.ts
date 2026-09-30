import type { AgentTrace } from './types.js'

export function logAgentTrace(
    trace: AgentTrace
) {
    console.log(
        JSON.stringify(
            {
                type: 'agent_trace',

                runId: trace.runId,

                userId: trace.userId,

                conversationId:
                    trace.conversationId,

                startedAt: trace.startedAt,

                finishedAt:
                    trace.finishedAt,

                finishReason:
                    trace.finishReason,

                durationMs:
                    trace.finishedAt
                        ? trace.finishedAt -
                        trace.startedAt
                        : undefined,

                steps: trace.steps,

                error: trace.error
            },
            null,
            2
        )
    )
}