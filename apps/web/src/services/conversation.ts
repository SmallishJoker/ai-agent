import { get, post } from './api'

import type {
    CreateConversationResponse,
    GetConversationResponse
} from '@/types/chat'

export function createConversation(
    userId: string,
    title = '新对话'
) {
    return post<
        { userId: string; title?: string },
        CreateConversationResponse
    >('/api/conversations', { userId, title })
}

export function getConversation(
    id: string,
    userId: string
) {
    return get<GetConversationResponse>(
        `/api/conversations/${id}/messages?userId=${encodeURIComponent(
            userId
        )}`
    )
}
