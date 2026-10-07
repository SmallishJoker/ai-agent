import { useOutletContext } from 'react-router-dom'

export interface ChatOutletContextValue {
  refreshConversations: () => Promise<void>
}

export function useChatOutletContext() {
  return useOutletContext<ChatOutletContextValue>()
}
