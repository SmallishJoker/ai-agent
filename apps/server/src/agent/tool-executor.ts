export async function executeToolSafely<T>(
    toolName: string,
    execute: () => Promise<T>
) {
    try {
        const result = await execute()

        return {
            success: true,
            toolName,
            result
        }
    } catch (error) {
        return {
            success: false,
            toolName,
            error:
                error instanceof Error
                    ? error.message
                    : 'Unknown tool error'
        }
    }
}