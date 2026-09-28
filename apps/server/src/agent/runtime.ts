import { streamText, stepCountIs, type ModelMessage } from 'ai'
import { chatModel } from '../config/ai.js'
import { tools } from '../tools/index.js'
import { buildAgentPrompt } from './prompts.js'
import type { AgentContext } from './index.js'

export interface AgentInput {
    messages: ModelMessage[],
    context?: AgentContext
}

export function runAgent({
    messages,
    context
}: AgentInput) {
    return streamText({
        model: chatModel,
        system: buildAgentPrompt(context),
        messages,
        tools,
        stopWhen: stepCountIs(5)
    })
}