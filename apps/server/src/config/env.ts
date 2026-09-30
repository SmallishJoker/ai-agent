export function toPositiveInt(
    value: string | undefined,
    fallback: number
) {
    const parsed = Number(value)

    if (!Number.isFinite(parsed) || parsed <= 0) {
        return fallback
    }

    return Math.floor(parsed)
}
