import type { ChatAddToolApproveResponseFunction } from 'ai'

import type { ChatUIMessage } from '@/types/chat'

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