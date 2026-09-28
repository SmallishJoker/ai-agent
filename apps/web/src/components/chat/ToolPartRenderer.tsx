import type { ReactNode } from 'react'

import type {
  ChatAddToolApproveResponseFunction,
  ToolUIPart
} from 'ai'

import type {
  ChatUIMessage,
  ChatUITools
} from '@/types/chat'

type ToolPart = ToolUIPart<ChatUITools>

import TicketApproval from './TicketApproval'

interface ToolPartRendererProps {
  part: ChatUIMessage['parts'][number]

  addToolApprovalResponse: ChatAddToolApproveResponseFunction
}

function ToolShell({
  title,
  children
}: {
  title: string
  children: ReactNode
}) {
  return (
    <div className="my-3 rounded-xl border bg-muted/40 p-4">
      <div className="flex items-center gap-2 font-medium">
        {title}
      </div>

      <div className="mt-2 text-sm text-muted-foreground">
        {children}
      </div>
    </div>
  )
}

function pendingText(part: ToolPart) {
  return part.state === 'input-streaming'
    ? '正在生成参数...'
    : '正在处理...'
}

function errorText(part: ToolPart) {
  return `调用失败：${
    'errorText' in part && part.errorText
      ? part.errorText
      : '未知错误'
  }`
}

function ToolPartRenderer({
  part,
  addToolApprovalResponse
}: ToolPartRendererProps) {
  if (part.type === 'tool-getWeather') {
    return (
      <ToolShell title="🔧 查询天气">
        {part.state === 'output-available'
          ? part.output.success
            ? `${part.output.city}：${part.output.weather}，${part.output.temperature}°C`
            : part.output.message
          : part.state === 'output-error'
            ? errorText(part)
            : pendingText(part)}
      </ToolShell>
    )
  }

  if (part.type === 'tool-getCurrentTime') {
    return (
      <ToolShell title="🕒 查询时间">
        {part.state === 'output-available'
          ? `${part.output.timezone}：${part.output.currentTime}`
          : part.state === 'output-error'
            ? errorText(part)
            : pendingText(part)}
      </ToolShell>
    )
  }

  if (part.type === 'tool-calculator') {
    return (
      <ToolShell title="🧮 数学计算">
        {part.state === 'output-available'
          ? 'error' in part.output
            ? part.output.error
            : `结果：${part.output.result}`
          : part.state === 'output-error'
            ? errorText(part)
            : pendingText(part)}
      </ToolShell>
    )
  }

  if (part.type === 'tool-getUserInfo') {
    return (
      <ToolShell title="👤 用户信息">
        {part.state === 'output-available'
          ? `${part.output.user.name}，${part.output.user.age} 岁`
          : part.state === 'output-error'
            ? errorText(part)
            : pendingText(part)}
      </ToolShell>
    )
  }

  if (part.type === 'tool-createTicket') {
    return (
      <TicketApproval
        part={part}
        onApprove={() => {
          if (!part.approval) {
            return
          }

          addToolApprovalResponse({
            id: part.approval.id,
            approved: true
          })
        }}
        onReject={() => {
          if (!part.approval) {
            return
          }

          addToolApprovalResponse({
            id: part.approval.id,
            approved: false,
            reason: '用户拒绝创建工单'
          })
        }}
      />
    )
  }

  return null
}

export default ToolPartRenderer
