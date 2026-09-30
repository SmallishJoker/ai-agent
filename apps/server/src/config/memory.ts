import 'dotenv/config'

import { toPositiveInt } from './env.js'

export const memoryConfig = {
    recentMessageLimit: toPositiveInt(
        process.env.MEMORY_RECENT_MESSAGES,
        10
    ),

    summaryBatchSize: toPositiveInt(
        process.env.MEMORY_SUMMARY_BATCH,
        10
    ),

    userMemoryLimit: toPositiveInt(
        process.env.USER_MEMORY_LIMIT,
        20
    ),

    semanticTopK: toPositiveInt(
        process.env.SEMANTIC_TOP_K,
        5
    )
}
