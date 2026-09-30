import type {
    UIMessage
} from 'ai'

import type { Conversation } from '@ai-agent/shared'

export interface AgentStep {
    index: number

    type: 'model' | 'tool' | 'finish'

    toolName?: string

    finishReason?: string

    startedAt: number

    finishedAt?: number

    error?: string
}

export type ChatUIDataTypes = {
    agentStep: AgentStep
}

export type { Conversation }

export interface CreateConversationResponse {
    success: boolean
    conversation: Conversation
}

export interface GetConversationResponse {
    success: boolean
    conversation: Conversation
    messages: ChatUIMessage[]
}

export type ChatUITools = {
    getWeather: {
        input: {
            city: string
        }

        output:
        | {
            success: true
            city: string
            temperature: number
            weather: string
        }
        | {
            success: false
            city: string
            message: string
        }
    }

    getCurrentTime: {
        input: {
            timezone: string
        }

        output: {
            timezone: string
            currentTime: string
        }
    }

    calculator: {
        input: {
            a: number
            b: number
            operation:
            | 'add'
            | 'subtract'
            | 'multiply'
            | 'divide'
        }

        output:
        | {
            result: number
        }
        | {
            error: string
        }
    }

    getUserInfo: {
        input: Record<string, never>

        output: {
            success: boolean
            user: {
                name: string
                age: number
            }
        }
    }

    createTicket: {
        input: {
            title: string
            description: string
            priority: 'low' | 'medium' | 'high'
        }

        output: {
            success: boolean
            demo: boolean
            ticketId: string
            title: string
            description: string
            priority: 'low' | 'medium' | 'high'
        }
    }
}

export type ChatUIMessage = UIMessage<
    never,
    ChatUIDataTypes,
    ChatUITools
>
