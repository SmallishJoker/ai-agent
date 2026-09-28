const STORAGE_KEY = 'ai-agent-user-id'

export function getUserId(): string {
  const existing =
    window.localStorage.getItem(STORAGE_KEY)

  if (existing) {
    return existing
  }

  const id = crypto.randomUUID()

  window.localStorage.setItem(STORAGE_KEY, id)

  return id
}
