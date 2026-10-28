import { useEffect } from 'react'

import type { ChatAddToolApproveResponseFunction } from 'ai'

import { ArrowDown } from 'lucide-react'

import {
  MessageScroller,
  MessageScrollerButton,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerProvider,
  MessageScrollerViewport,
  useMessageScroller
} from '@/components/ui/message-scroller'

import type { ChatUIMessage } from '@/types/chat'

import MessageBubble from './MessageBubble'
import TypingIndicator from './TypingIndicator'

function ScrollToEndOnNewUserMessage({
  messages
}: {
  messages: ChatUIMessage[]
}) {
  const { scrollToEnd } = useMessageScroller()

  const lastMessage = messages[messages.length - 1]

  const lastUserId =
    lastMessage?.role === 'user'
      ? lastMessage.id
      : null

  useEffect(() => {
    if (!lastUserId) {
      return
    }

    scrollToEnd({ behavior: 'auto' })
  }, [lastUserId, scrollToEnd])

  return null
}

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
        <ScrollToEndOnNewUserMessage messages={messages} />

        <MessageScrollerViewport>
          <MessageScrollerContent className="mx-auto w-full max-w-3xl px-4 py-6">
            {messages.map(message => (
              <MessageScrollerItem
                key={message.id}
                messageId={message.id}
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
