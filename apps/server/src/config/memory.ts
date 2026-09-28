import 'dotenv/config'

function toPositiveInt(
    value: string | undefined,
    fallback: number
) {
    const parsed = Number(value)

    if (!Number.isFinite(parsed) || parsed <= 0) {
        return fallback
    }

    return Math.floor(parsed)
}

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
    )
}
