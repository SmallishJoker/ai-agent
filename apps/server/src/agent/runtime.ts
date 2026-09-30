import {
    streamText,
    stepCountIs,
    type ModelMessage,
    type StopCondition
} from 'ai'

import { chatModel } from '../config/ai.js'
import { agentConfig } from '../config/agent.js'
import { tools } from '../tools/index.js'
import { buildAgentPrompt } from './prompts.js'
import { createRunId } from '../utils/run-id.js'
import { createTimer } from './timer.js'
import {
    addAgentStep,
    createAgentTrace,
    finishAgentTrace
} from './trace.js'
import type { AgentContext } from './index.js'
import type {
    AgentStep,
    AgentTrace
} from './types.js'

export interface AgentInput {
    messages: ModelMessage[]

    context?: AgentContext

    runId?: string

    onStep?: (step: AgentStep) => void

    onTrace?: (trace: AgentTrace) => void
}

export function maxToolCallsIs(
    limit: number
): StopCondition<any, any> {
    return ({ steps }) => {
        const toolCalls = steps.reduce(
            (total, step) =>
                total + step.toolCalls.length,
            0
        )

        return toolCalls >= limit
    }
}

export function runAgent({
    messages,
    context,
    runId,
    onStep,
    onTrace
}: AgentInput) {
    const trace = createAgentTrace({
        runId: runId ?? createRunId(),
        userId: context?.userId ?? 'unknown',
        conversationId:
            context?.conversationId ?? 'unknown'
    })

    let index = 0
    let stepTimer = createTimer()
    let finished = false

    const emit = (
        step: Omit<
            AgentStep,
            | 'index'
            | 'startedAt'
            | 'finishedAt'
            | 'durationMs'
        >
    ) => {
        const timing = stepTimer.end()
        stepTimer = createTimer()

        const agentStep: AgentStep = {
            index: index++,
            startedAt: timing.startedAt,
            finishedAt: timing.finishedAt,
            durationMs: timing.durationMs,
            ...step
        }

        addAgentStep(trace, agentStep)
        onStep?.(agentStep)
    }

    const finish = (data: {
        finishReason?: AgentTrace['finishReason']
        usage?: AgentTrace['usage']
        error?: string
    }) => {
        if (finished) {
            return
        }

        finished = true

        finishAgentTrace(trace, data)
        onTrace?.(trace)
    }

    return streamText({
        model: chatModel,
        system: buildAgentPrompt(context),
        messages,
        tools,

        stopWhen: [
            stepCountIs(agentConfig.maxSteps),
            maxToolCallsIs(agentConfig.maxToolCalls)
        ],

        onStepStart: () => {
            emit({ type: 'model' })
        },

        onToolExecutionEnd: event => {
            emit({
                type: 'tool',
                toolName: event.toolCall.toolName,
                input: event.toolCall.input,
                output:
                    event.toolOutput.type === 'tool-result'
                        ? event.toolOutput.output
                        : undefined,
                error:
                    event.toolOutput.type === 'tool-error'
                        ? String(event.toolOutput.error)
                        : undefined
            })
        },

        onFinish: event => {
            emit({
                type: 'finish',
                finishReason: event.finishReason
            })

            finish({
                finishReason: event.finishReason,
                usage: {
                    inputTokens:
                        event.totalUsage.inputTokens,
                    outputTokens:
                        event.totalUsage.outputTokens,
                    totalTokens:
                        event.totalUsage.totalTokens
                }
            })
        },

        onError: ({ error }) => {
            finish({
                error:
                    error instanceof Error
                        ? error.message
                        : String(error)
            })
        },

        onAbort: () => {
            finish({ error: 'aborted' })
        }
    })
}
