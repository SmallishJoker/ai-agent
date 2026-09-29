import 'dotenv/config'
import { createOpenAI } from '@ai-sdk/openai'

export const openai = createOpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    baseURL: process.env.OPENAI_BASE_URL,
});

export const chatModel = openai(process.env.OPENAI_MODEL as string)

const embeddingApiKey = process.env.EMBEDDING_API_KEY
const embeddingModelId = process.env.EMBEDDING_MODEL

export const embeddingModel =
    embeddingApiKey && embeddingModelId
        ? createOpenAI({
            apiKey: embeddingApiKey,
            baseURL: process.env.EMBEDDING_BASE_URL
        }).embedding(embeddingModelId)
        : null

export const embeddingDimensions = Number(
    process.env.EMBEDDING_DIMENSIONS ?? 1536
)
