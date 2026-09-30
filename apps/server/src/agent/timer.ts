export function createTimer() {
    const startedAt = Date.now()

    return {
        startedAt,

        end() {
            const finishedAt = Date.now()

            return {
                startedAt,

                finishedAt,

                durationMs:
                    finishedAt - startedAt
            }
        }
    }
}