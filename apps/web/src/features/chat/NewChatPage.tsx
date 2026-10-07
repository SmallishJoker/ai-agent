import { useMemo, useState } from 'react'

import { useNavigate } from 'react-router-dom'

import ChatInput from '@/components/chat/ChatInput'
import ChatWelcome from '@/components/chat/ChatWelcome'
import ErrorBoundary from '@/components/ErrorBoundary'

import { useChatOutletContext } from './context'
import { setPendingInitialMessage } from './pending-message'

import { createConversation } from '@/services/conversation'

import { getConversationPath } from '@/lib/route'
import { getUserId } from '@/lib/user'

function NewChatPage() {
  const navigate = useNavigate()
  const userId = useMemo(() => getUserId(), [])

  const { refreshConversations } =
    useChatOutletContext()

  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(
    null
  )

  const handleSubmit = async () => {
    const content = input.trim()

    if (!content || loading) {
      return
    }

    setLoading(true)
    setError(null)

    try {
      const data = await createConversation(userId)

      setInput('')

      void refreshConversations()

      setPendingInitialMessage(
        data.conversation.id,
        content
      )

      navigate(
        getConversationPath(data.conversation.id),
        { replace: true }
      )
    } catch (createError) {
      console.error(createError)

      setError('创建会话失败，请重试')
      setLoading(false)
    }
  }

  return (
    <>
      <ErrorBoundary>
        <ChatWelcome />
      </ErrorBoundary>

      {error && (
        <div className="border-t border-destructive/30 bg-destructive/10 px-4 py-2 text-center text-sm text-destructive">
          {error}
        </div>
      )}

      <ChatInput
        value={input}
        loading={loading}
        onChange={setInput}
        onSubmit={handleSubmit}
      />
    </>
  )
}

export default NewChatPage
