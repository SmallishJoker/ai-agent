import {
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react'

import {
  useNavigate,
  useParams
} from 'react-router-dom'

import {
  DefaultChatTransport,
  lastAssistantMessageIsCompleteWithApprovalResponses
} from 'ai'

import { useChat } from '@ai-sdk/react'

import ChatInput from '@/components/chat/ChatInput'
import ChatWelcome from '@/components/chat/ChatWelcome'
import ErrorBoundary from '@/components/ErrorBoundary'
import MessageList from '@/components/chat/MessageList'

import { useChatOutletContext } from './context'
import { takePendingInitialMessage } from './pending-message'

import { getConversation } from '@/services/conversation'

import { sanitizeMessages } from '@/lib/messages'
import { getUserId } from '@/lib/user'

import type { ChatUIMessage } from '@/types/chat'

function ConversationPage() {
  const { conversationId = '' } = useParams<{
    conversationId: string
  }>()

  const navigate = useNavigate()
  const userId = useMemo(() => getUserId(), [])

  const { refreshConversations } =
    useChatOutletContext()

  const loadRequestIdRef = useRef(0)

  const [isInitializing, setIsInitializing] =
    useState(true)

  const [input, setInput] = useState('')

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
    stop,
    addToolApprovalResponse
  } = useChat<ChatUIMessage>({
    transport,

    onFinish: () => {
      void refreshConversations()
    },

    sendAutomaticallyWhen:
      lastAssistantMessageIsCompleteWithApprovalResponses
  })

  useEffect(() => {
    const requestId = ++loadRequestIdRef.current
    const controller = new AbortController()

    // Abort any response still streaming for the previous conversation so it
    // can't append messages into the conversation we're switching to.
    stop()

    async function load() {
      const initialMessage =
        takePendingInitialMessage(conversationId)

      if (initialMessage) {
        setMessages([])
        setIsInitializing(false)
        sendMessage({ text: initialMessage })
        return
      }

      setIsInitializing(true)
      setMessages([])

      try {
        const data = await getConversation(
          conversationId,
          userId,
          controller.signal
        )

        if (
          controller.signal.aborted ||
          requestId !== loadRequestIdRef.current
        ) {
          return
        }

        setMessages(sanitizeMessages(data.messages))
        setIsInitializing(false)
      } catch (loadError) {
        if (
          controller.signal.aborted ||
          requestId !== loadRequestIdRef.current
        ) {
          return
        }

        console.error(loadError)
        navigate('/', { replace: true })
      }
    }

    void load()

    return () => {
      controller.abort()
    }
  }, [
    conversationId,
    navigate,
    sendMessage,
    setMessages,
    stop,
    userId
  ])

  const loading =
    status === 'submitted' ||
    status === 'streaming'

  const streamingMessageId = useMemo(() => {
    if (status !== 'streaming') {
      return null
    }

    const lastMessage =
      messages[messages.length - 1]

    return lastMessage?.role === 'assistant'
      ? lastMessage.id
      : null
  }, [messages, status])

  const handleSubmit = () => {
    const content = input.trim()

    if (!content || loading) {
      return
    }

    sendMessage({ text: content })

    setInput('')
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <ErrorBoundary key={conversationId}>
        {isInitializing ? (
          <div className="flex min-h-0 flex-1 items-center justify-center text-muted-foreground">
            正在初始化会话...
          </div>
        ) : messages.length === 0 ? (
          <div className="flex min-h-0 flex-1 items-center justify-center">
            <ChatWelcome />
          </div>
        ) : (
          <MessageList
            messages={messages}
            addToolApprovalResponse={
              addToolApprovalResponse
            }
            isThinking={status === 'submitted'}
            streamingMessageId={streamingMessageId}
          />
        )}
      </ErrorBoundary>

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

export default ConversationPage
