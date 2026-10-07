// Hand-off for the first message typed on the `/` landing page.
// The conversation view consumes it once after it mounts, so rapid
// navigation / back-forward can never resend it.
let pending: {
  conversationId: string
  text: string
} | null = null

export function setPendingInitialMessage(
  conversationId: string,
  text: string
) {
  pending = { conversationId, text }
}

export function takePendingInitialMessage(
  conversationId: string
): string | null {
  if (
    !pending ||
    pending.conversationId !== conversationId
  ) {
    return null
  }

  const { text } = pending

  pending = null

  return text
}
