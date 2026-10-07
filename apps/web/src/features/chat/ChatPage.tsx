import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react'

import {
  Outlet,
  useLocation,
  useNavigate,
  useSearchParams
} from 'react-router-dom'

import ChatHeader from '@/components/chat/ChatHeader'
import { SidebarProvider } from '@/components/ui/sidebar'
import { AppSidebar } from '@/features/side/AppSidebar'

import { getAllConversations } from '@/services/conversation'

import {
  getConversationIdFromPath,
  getConversationPath
} from '@/lib/route'

import { getUserId } from '@/lib/user'

import type { Conversation } from '@/types/chat'

function ChatPage() {
  const userId = useMemo(() => getUserId(), [])
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()

  const activeConversationId =
    getConversationIdFromPath(location.pathname)

  const [conversations, setConversations] =
    useState<Conversation[]>([])

  const [conversationsLoading, setConversationsLoading] =
    useState(true)

  const refreshSeqRef = useRef(0)

  const refreshConversations = useCallback(
    async () => {
      const seq = ++refreshSeqRef.current

      try {
        const data = await getAllConversations(userId)

        // Ignore responses that arrive out of order.
        if (seq !== refreshSeqRef.current) {
          return
        }

        setConversations(data.conversations)
      } catch (conversationsError) {
        console.error(conversationsError)
      } finally {
        if (seq === refreshSeqRef.current) {
          setConversationsLoading(false)
        }
      }
    },
    [userId]
  )

  useEffect(() => {
    async function load() {
      await refreshConversations()
    }

    void load()
  }, [refreshConversations])

  useEffect(() => {
    const legacyId = searchParams.get('c')

    if (legacyId) {
      navigate(getConversationPath(legacyId), {
        replace: true
      })
    }
  }, [navigate, searchParams])

  const outletContext = useMemo(
    () => ({ refreshConversations }),
    [refreshConversations]
  )

  const handleSelectConversation = (id: string) => {
    navigate(getConversationPath(id))
  }

  const handleNewConversation = () => {
    navigate('/')
  }

  return (
    <div className="flex h-svh flex-col bg-background">
      <SidebarProvider>
        <AppSidebar
          conversations={conversations}
          activeConversationId={activeConversationId}
          loading={conversationsLoading}
          onSelectConversation={handleSelectConversation}
          onNewConversation={handleNewConversation}
        />

        <main className="relative flex flex-1 flex-col overflow-y-auto">
          <ChatHeader />

          <Outlet context={outletContext} />
        </main>
      </SidebarProvider>
    </div>
  )
}

export default ChatPage
