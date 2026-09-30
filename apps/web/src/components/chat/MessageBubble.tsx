import { useState } from 'react'

import { Bug } from 'lucide-react'

import type { ChatAddToolApproveResponseFunction } from 'ai'

import type { ChatUIMessage } from '@/types/chat'

import { Button } from '@/components/ui/button'

import AgentTrace from '../agent/AgentTrace'

import MarkdownRenderer from './MarkdownRenderer'

import ToolPartRenderer from './ToolPartRenderer'

interface MessageBubbleProps {
  message: ChatUIMessage

  addToolApprovalResponse: ChatAddToolApproveResponseFunction
}

function MessageBubble({
  message,
  addToolApprovalResponse
}: MessageBubbleProps) {
  const isUser =
    message.role === 'user'

  const runId = message.parts.find(
    part => part.type === 'data-agentRun'
  )?.data.runId

  const [showTrace, setShowTrace] =
    useState(false)

  return (
    <div
      className={
        isUser
          ? 'flex justify-end'
          : 'flex justify-start'
      }
    >
      <div
        className={
          isUser
            ? 'max-w-[80%] rounded-2xl rounded-br-md bg-primary px-4 py-3 text-primary-foreground'
            : 'max-w-[80%] px-1 py-3'
        }
      >
        {!isUser && runId && (
          <div className="mb-2 flex justify-end">
            <Button
              variant="ghost"
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
          <div className="my-3 rounded-xl border bg-muted/30 p-3">
            <AgentTrace runId={runId} />
          </div>
        )}

        {message.parts.map(
          (part, index) => {
            if (
              part.type === 'text'
            ) {
              return isUser ? (
                <div
                  key={index}
                  className="whitespace-pre-wrap leading-7"
                >
                  {part.text}
                </div>
              ) : (
                <MarkdownRenderer
                  key={index}
                  content={part.text}
                />
              )
            }

            if (
              part.type === 'data-agentStep' ||
              part.type === 'data-agentRun'
            ) {
              return null
            }

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
        )}
      </div>
    </div>
  )
}

export default MessageBubble
