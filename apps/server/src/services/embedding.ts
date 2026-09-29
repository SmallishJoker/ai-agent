import { embed } from 'ai'
import {
    embeddingDimensions,
    embeddingModel
} from '../config/ai.js'

export async function generateEmbedding(
    text: string
): Promise<number[] | null> {
    if (!embeddingModel) {
        return null
    }

    try {
        const result = await embed({
            model: embeddingModel,
            value: text,
            providerOptions: {
                openai: {
                    dimensions: embeddingDimensions
                }
            }
        })

        return result.embedding
    } catch (error) {
        console.error(
            '[embedding] failed to generate embedding:',
            error
        )

        return null
    }
}
