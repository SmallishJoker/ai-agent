import type { ChatAddToolApproveResponseFunction } from 'ai'

import type { ChatUIMessage } from '@/types/chat'

import MessageBubble from './MessageBubble'
import TypingIndicator from './TypingIndicator'

interface MessageListProps {
  messages: ChatUIMessage[]

  addToolApprovalResponse: ChatAddToolApproveResponseFunction

  isThinking?: boolean
}

function MessageList({
  messages,
  addToolApprovalResponse,
  isThinking = false
}: MessageListProps) {
  return (
    <div className="mx-auto flex w-full flex-1 max-w-3xl flex-col gap-6 py-8">
      {messages.map(message => (
        <MessageBubble
          key={message.id}
          message={message}
          addToolApprovalResponse={
            addToolApprovalResponse
          }
        />
      ))}

      {isThinking && <TypingIndicator />}
    </div>
  )
}

export default MessageList