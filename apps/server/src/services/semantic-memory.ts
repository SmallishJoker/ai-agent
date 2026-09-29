import { generateEmbedding } from './embedding.js'
import {
    searchUserMemories
} from '../repositories/memory.repository.js'

export async function searchRelevantMemories(
    userId: string,
    query: string,
    limit = 5
) {
    const embedding = await generateEmbedding(query)

    if (!embedding) {
        return null
    }

    return searchUserMemories(
        userId,
        embedding,
        limit
    )
}
