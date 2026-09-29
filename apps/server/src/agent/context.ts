import { buildMemoryContext } from './memory-context.js'
import type { AgentContext } from './index.js'

export interface BuildAgentContextInput {
    conversationId: string
    userId: string,
    currentUserMessage: string
}

export async function buildAgentContext({
    conversationId,
    userId,
    currentUserMessage
}: BuildAgentContextInput): Promise<AgentContext> {
    const memory = await buildMemoryContext(
        conversationId,
        userId,
        currentUserMessage
    )

    return {
        userId,
        conversationId,
        locale: 'zh-CN',
        timezone: 'Asia/Shanghai',
        memory
    }
}
