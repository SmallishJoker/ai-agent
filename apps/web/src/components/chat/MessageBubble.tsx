import { useState } from 'react'

import { Bug } from 'lucide-react'

import type { ChatAddToolApproveResponseFunction } from 'ai'

import type { ChatUIMessage } from '@/types/chat'

import { Button } from '@/components/ui/button'
import {
  Bubble,
  BubbleContent
} from '@/components/ui/bubble'
import {
  Message,
  MessageContent
} from '@/components/ui/message'

import AgentTrace from '../agent/AgentTrace'

import ChainOfThought from './ChainOfThought'

import ToolPartRenderer from './ToolPartRenderer'

import TypewriterMarkdown from './TypewriterMarkdown'

interface MessageBubbleProps {
  message: ChatUIMessage

  addToolApprovalResponse: ChatAddToolApproveResponseFunction

  isStreaming?: boolean
}

function MessageBubble({
  message,
  addToolApprovalResponse,
  isStreaming = false
}: MessageBubbleProps) {
  const isUser = message.role === 'user'

  const runId = message.parts.find(
    part => part.type === 'data-agentRun'
  )?.data?.runId

  const [showTrace, setShowTrace] =
    useState(false)

  return (
    <Message align={isUser ? 'end' : 'start'}>
      <MessageContent>
        {!isUser && runId && (
          <div className="flex justify-start">
            <Button
              variant="secondary"
              size="xs"
              onClick={() =>
                setShowTrace(value => !value)
              }
            >
              <Bug />
              {showTrace ? '收起轨迹' : '调试'}
            </Button>
          </div>
        )}

        {!isUser && showTrace && runId && (
          <div className="rounded-xl border p-3">
            <AgentTrace runId={runId} />
          </div>
        )}

        {!isUser && (
          <ChainOfThought parts={message.parts} />
        )}

        {message.parts.map((part, index) => {
          if (part.type === 'text') {
            return isUser ? (
              <Bubble
                key={index}
                align="end"
                variant="muted"
              >
                <BubbleContent className="whitespace-pre-wrap leading-7">
                  {part.text}
                </BubbleContent>
              </Bubble>
            ) : (
              <TypewriterMarkdown
                key={index}
                content={part.text}
                active={isStreaming}
              />
            )
          }

          if (
            part.type === 'data-agentStep' ||
            part.type === 'data-agentRun'
          ) {
            return null
          }

          if (part.type === 'tool-createTicket') {
            return (
              <ToolPartRenderer
                key={index}
                part={part}
                addToolApprovalResponse={
                  addToolApprovalResponse
                }
              />
            )
          }

          return null
        })}
      </MessageContent>
    </Message>
  )
}

export default MessageBubble
