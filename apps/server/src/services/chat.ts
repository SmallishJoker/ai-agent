import {
  convertToModelMessages,
  type UIMessage
} from 'ai'

import { buildAgentContext } from '../agent/context.js'
import { runAgent } from '../agent/runtime.js'

export async function streamChat(
  conversationId: string,
  messages: UIMessage[],
  userId: string
) {
  const [modelMessages, context] =
    await Promise.all([
      convertToModelMessages(messages),
      buildAgentContext({ conversationId, userId })
    ])

  return runAgent({
    messages: modelMessages,
    context
  })
}
