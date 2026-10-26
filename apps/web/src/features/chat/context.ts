import type { RefObject } from 'react'

import { useOutletContext } from 'react-router-dom'

export interface ChatOutletContextValue {
  refreshConversations: () => Promise<void>

  scrollContainerRef: RefObject<HTMLElement | null>
}

export function useChatOutletContext() {
  return useOutletContext<ChatOutletContextValue>()
}
