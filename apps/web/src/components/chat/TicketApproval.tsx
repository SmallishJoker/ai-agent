import type { ToolUIPart } from 'ai'

import type { ChatUITools } from '@/types/chat'

import { Button } from '@/components/ui/button'

type CreateTicketToolPart = Extract<
  ToolUIPart<ChatUITools>,
  { type: 'tool-createTicket' }
>

interface Props {
  part: CreateTicketToolPart

  onApprove: () => void

  onReject: () => void
}

function TicketApproval({
  part,
  onApprove,
  onReject
}: Props) {
  if (part.state === 'approval-requested') {
    return (
      <div className="my-3 rounded-xl border bg-muted/40 p-4">
        <div className="font-medium">
          🛠 AI 请求创建工单
        </div>

        <div className="mt-2 space-y-1 text-sm text-muted-foreground">
          <div>
            <strong>标题：</strong>
            {part.input?.title}
          </div>

          <div>
            <strong>描述：</strong>
            {part.input?.description}
          </div>

          <div>
            <strong>优先级：</strong>
            {part.input?.priority}
          </div>
        </div>

        <div className="mt-3 rounded-lg bg-amber-500/10 px-3 py-2 text-sm text-amber-600">
          ⚠️ 创建工单属于真实业务操作，请确认后继续。
        </div>

        <div className="mt-3 flex justify-end gap-2">
          <Button variant="outline" onClick={onReject}>
            拒绝
          </Button>

          <Button onClick={onApprove}>确认创建</Button>
        </div>
      </div>
    )
  }

  if (part.state === 'output-available') {
    return (
      <div className="my-3 rounded-xl border bg-muted/40 p-4 text-sm">
        ✅ 工单创建成功（演示：工单号 {part.output.ticketId}
        ，未真正写入业务系统）
      </div>
    )
  }

  if (part.state === 'output-denied') {
    return (
      <div className="my-3 rounded-xl border bg-muted/40 p-4 text-sm text-muted-foreground">
        ❌ 用户拒绝创建工单
      </div>
    )
  }

  return null
}

export default TicketApproval
