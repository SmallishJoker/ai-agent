import { buildMemoryContext } from './memory-context.js'
import type { AgentContext } from './index.js'

export interface BuildAgentContextInput {
    conversationId: string
    userId: string
}

export async function buildAgentContext({
    conversationId,
    userId
}: BuildAgentContextInput): Promise<AgentContext> {
    const memory = await buildMemoryContext(
        conversationId,
        userId
    )

    return {
        userId,
        conversationId,
        locale: 'zh-CN',
        timezone: 'Asia/Shanghai',
        memory
    }
}
