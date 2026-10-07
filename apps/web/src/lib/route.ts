const CONVERSATION_PREFIX = '/c/'

export function getConversationPath(
  id: string
): string {
  return `${CONVERSATION_PREFIX}${encodeURIComponent(id)}`
}

export function getConversationIdFromPath(
  pathname: string = window.location.pathname
): string | null {
  if (!pathname.startsWith(CONVERSATION_PREFIX)) {
    return null
  }

  const id = pathname
    .slice(CONVERSATION_PREFIX.length)
    .replace(/\/+$/, '')

  return id.length > 0
    ? decodeURIComponent(id)
    : null
}
