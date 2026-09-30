import type { FinishReason } from 'ai'

export type AgentFinishReason = FinishReason

export interface AgentBudget {
    maxSteps: number

    maxToolCalls: number
}

export type AgentStepType =
    | 'model'
    | 'tool'
    | 'finish'

export interface AgentStep {
    index: number

    type: AgentStepType

    toolName?: string

    finishReason?: AgentFinishReason

    startedAt: number

    finishedAt?: number

    durationMs?: number

    input?: unknown

    output?: unknown

    error?: string
}

export interface AgentUsage {
    inputTokens?: number

    outputTokens?: number

    totalTokens?: number
}

export interface AgentTrace {
    runId: string

    userId: string

    conversationId: string

    startedAt: number

    finishedAt?: number

    steps: AgentStep[]

    finishReason?: AgentFinishReason

    usage?: AgentUsage

    error?: string
}
