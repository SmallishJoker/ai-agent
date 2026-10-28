import type { ChatAddToolApproveResponseFunction } from 'ai'

import { ArrowDown } from 'lucide-react'

import {
  MessageScroller,
  MessageScrollerButton,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerProvider,
  MessageScrollerViewport
} from '@/components/ui/message-scroller'

import type { ChatUIMessage } from '@/types/chat'

import MessageBubble from './MessageBubble'
import TypingIndicator from './TypingIndicator'

interface MessageListProps {
  messages: ChatUIMessage[]

  addToolApprovalResponse: ChatAddToolApproveResponseFunction

  isThinking?: boolean

  streamingMessageId?: string | null
}

function MessageList({
  messages,
  addToolApprovalResponse,
  isThinking = false,
  streamingMessageId = null
}: MessageListProps) {
  return (
    <MessageScrollerProvider
      autoScroll
      defaultScrollPosition="end"
    >
      <MessageScroller className="min-h-0 flex-1">
        <MessageScrollerViewport>
          <MessageScrollerContent className="mx-auto w-full max-w-3xl px-4 py-6">
            {messages.map(message => (
              <MessageScrollerItem
                key={message.id}
                messageId={message.id}
                scrollAnchor={message.role === 'user'}
              >
                <MessageBubble
                  message={message}
                  addToolApprovalResponse={
                    addToolApprovalResponse
                  }
                  isStreaming={
                    message.id === streamingMessageId
                  }
                />
              </MessageScrollerItem>
            ))}

            {isThinking && <TypingIndicator />}
          </MessageScrollerContent>
        </MessageScrollerViewport>

        <MessageScrollerButton
          variant="outline"
          size="icon"
          className="rounded-full bg-background/90 shadow-md backdrop-blur"
        >
          <ArrowDown />
        </MessageScrollerButton>
      </MessageScroller>
    </MessageScrollerProvider>
  )
}

export default MessageList
