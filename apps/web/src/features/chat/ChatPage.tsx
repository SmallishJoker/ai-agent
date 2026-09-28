import {
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react'

import {
  DefaultChatTransport,
  lastAssistantMessageIsCompleteWithApprovalResponses
} from 'ai'

import {
  useChat
} from '@ai-sdk/react'

import ChatHeader from '@/components/chat/ChatHeader'
import ChatInput from '@/components/chat/ChatInput'
import MessageList from '@/components/chat/MessageList'

import {
  createConversation,
  getConversation
} from '@/services/conversation'

import { getUserId } from '@/lib/user'

import type { ChatUIMessage } from '@/types/chat'

function ChatPage() {
  const userId = useMemo(() => getUserId(), [])

  const initializedRef = useRef(false)

  const [conversationId, setConversationId] =
    useState<string | null>(null)

  const [isInitializing, setIsInitializing] =
    useState(true)

  const transport = useMemo(
    () =>
      new DefaultChatTransport<ChatUIMessage>({
        api: '/api/chat',

        prepareSendMessagesRequest: ({
          id,
          messages: requestMessages,
          trigger,
          messageId,
          body
        }) => ({
          body: {
            ...body,
            id,
            messages: requestMessages,
            userId,
            trigger,
            messageId,
            conversationId
          }
        })
      }),
    [userId, conversationId]
  )

  const {
    messages,
    sendMessage,
    setMessages,
    status,
    error,
    addToolApprovalResponse
  } = useChat<ChatUIMessage>({
    transport,

    sendAutomaticallyWhen:
      lastAssistantMessageIsCompleteWithApprovalResponses
  })

  useEffect(() => {
    if (initializedRef.current) {
      return
    }

    initializedRef.current = true

    async function init() {
      try {
        const url = new URL(
          window.location.href
        )

        const existingId =
          url.searchParams.get('c')

        if (existingId) {
          try {
            const data = await getConversation(
              existingId,
              userId
            )

            setConversationId(existingId)

            setMessages(data.messages)
            return
          } catch {
            url.searchParams.delete('c')
          }
        }

        const data = await createConversation(userId)

        setConversationId(data.conversation.id)

        url.searchParams.set(
          'c',
          data.conversation.id
        )

        window.history.replaceState(
          null,
          '',
          url.toString()
        )
      } catch (initError) {
        console.error(initError)
      } finally {
        setIsInitializing(false)
      }
    }

    init()
  }, [setMessages, userId])

  const [
    input,
    setInput
  ] = useState('')

  const loading =
    status === 'submitted' ||
    status === 'streaming'

  const handleSubmit = () => {
    const content =
      input.trim()

    if (
      !content ||
      loading ||
      !conversationId
    ) {
      return
    }

    sendMessage({
      text: content
    })

    setInput('')
  }

  return (
    <div className="flex h-svh flex-col bg-background">
      <ChatHeader />

      <main className="min-h-0 flex-1 overflow-y-auto">
        {isInitializing ? (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            正在初始化会话...
          </div>
        ) : messages.length === 0 ? (
          <div className="flex h-full items-center justify-center px-6">
            <div className="text-center">
              <h1 className="text-3xl font-semibold tracking-tight">
                你好，我是 AI Agent
              </h1>

              <p className="mt-3 text-muted-foreground">
                可以聊天，也可以调用工具完成任务。
              </p>
            </div>
          </div>
        ) : (
          <MessageList
            messages={messages}
            addToolApprovalResponse={
              addToolApprovalResponse
            }
            isThinking={
              status === 'submitted'
            }
          />
        )}
      </main>

      {error && (
        <div className="border-t border-destructive/30 bg-destructive/10 px-4 py-2 text-center text-sm text-destructive">
          请求失败：{error.message}
        </div>
      )}

      <ChatInput
        value={input}
        loading={loading || isInitializing}
        onChange={setInput}
        onSubmit={handleSubmit}
      />
    </div>
  )
}

export default ChatPage
