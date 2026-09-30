import {
  convertToModelMessages,
  type UIMessage
} from 'ai'

import { buildAgentContext } from '../agent/context.js'
import { runAgent } from '../agent/runtime.js'
import type {
  AgentStep,
  AgentTrace
} from '../agent/types.js'

export interface StreamChatOptions {
  runId?: string

  onStep?: (step: AgentStep) => void

  onTrace?: (trace: AgentTrace) => void
}

function getLastUserText(messages: UIMessage[]) {
  for (let i = messages.length - 1; i >= 0; i--) {
    const message = messages[i]

    if (message.role !== 'user') {
      continue
    }

    return message.parts
      .filter(part => part.type === 'text')
      .map(part => part.text)
      .join('')
      .trim()
  }

  return ''
}

export async function streamChat(
  conversationId: string,
  messages: UIMessage[],
  userId: string,
  options: StreamChatOptions = {}
) {
  const [modelMessages, context] =
    await Promise.all([
      convertToModelMessages(messages),
      buildAgentContext({
        conversationId,
        userId,
        currentUserMessage: getLastUserText(messages)
      })
    ])

  return runAgent({
    messages: modelMessages,
    context,
    runId: options.runId,
    onStep: options.onStep,
    onTrace: options.onTrace
  })
}
