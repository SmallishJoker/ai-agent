import { get, post } from './api'

import type {
    CreateConversationResponse,
    GetAllConversationsResponse,
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
    userId: string,
    signal?: AbortSignal
) {
    return get<GetConversationResponse>(
        `/api/conversations/${id}/messages?userId=${encodeURIComponent(
            userId
        )}`,
        { signal }
    )
}

export function getAllConversations(
    userId: string
) {
    return get<GetAllConversationsResponse>(
        `/api/getAllConversations?userId=${encodeURIComponent(
            userId
        )}`
    )
}
