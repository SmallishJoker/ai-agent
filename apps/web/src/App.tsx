import {
  BrowserRouter,
  Navigate,
  Route,
  Routes
} from 'react-router-dom'

import ChatPage from './features/chat/ChatPage'
import ConversationPage from './features/chat/ConversationPage'
import NewChatPage from './features/chat/NewChatPage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ChatPage />}>
          <Route index element={<NewChatPage />} />

          <Route
            path="c/:conversationId"
            element={<ConversationPage />}
          />

          <Route
            path="*"
            element={<Navigate to="/" replace />}
          />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
