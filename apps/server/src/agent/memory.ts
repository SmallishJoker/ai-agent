export interface AgentMemory {
    summary: string | null
    recentMessages: unknown[]
    userMemories: UserMemory[]
}

export interface UserMemory {
    id: string
    userId: string
    content: string
    type: string
    importance: number
    createdAt: Date
    updatedAt: Date
}