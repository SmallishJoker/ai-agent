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
import type { AgentContext } from './index.js'
import type { AgentStep } from './types.js'

export interface AgentInput {
    messages: ModelMessage[]

    context?: AgentContext

    onStep?: (step: AgentStep) => void
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
    onStep
}: AgentInput) {
    let index = 0
    let lastAt = Date.now()

    const emit = (
        step: Omit<
            AgentStep,
            'index' | 'startedAt' | 'finishedAt'
        >
    ) => {
        const now = Date.now()

        onStep?.({
            index: index++,
            startedAt: lastAt,
            finishedAt: now,
            ...step
        })

        lastAt = now
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

        onStepEnd: () => {
            emit({ type: 'model' })
        },

        onToolExecutionEnd: event => {
            emit({
                type: 'tool',
                toolName: event.toolCall.toolName,
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
        }
    })
}
