import type { AgentMemory } from './memory.js'

export interface AgentContext {
    userId?: string
    conversationId?: string
    locale?: string
    timezone?: string

    memory?: AgentMemory
}
