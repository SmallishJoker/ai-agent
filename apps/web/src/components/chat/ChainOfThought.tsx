import { useState } from 'react'

import {
  Brain,
  Calculator,
  Clock,
  CloudSun,
  Ticket,
  User,
  type LucideIcon
} from 'lucide-react'

import type { ToolUIPart } from 'ai'

import {
  Trace,
  TraceCollapsible,
  TraceCollapsibleContent,
  TraceCollapsibleTrigger,
  TraceDescription,
  TraceIcon,
  TraceLine,
  TraceTitle
} from '@/components/ui/trace'

import type {
  ChatUIMessage,
  ChatUITools
} from '@/types/chat'

type ToolPart = ToolUIPart<ChatUITools>

const TOOL_LABELS: Record<ToolPart['type'], string> = {
  'tool-getWeather': '查询天气',
  'tool-getCurrentTime': '查询时间',
  'tool-calculator': '数学计算',
  'tool-getUserInfo': '获取用户信息',
  'tool-createTicket': '创建工单'
}

const TOOL_ICONS: Record<ToolPart['type'], LucideIcon> = {
  'tool-getWeather': CloudSun,
  'tool-getCurrentTime': Clock,
  'tool-calculator': Calculator,
  'tool-getUserInfo': User,
  'tool-createTicket': Ticket
}

const OPERATION_SYMBOLS = {
  add: '+',
  subtract: '−',
  multiply: '×',
  divide: '÷'
} as const

function isToolPart(
  part: ChatUIMessage['parts'][number]
): part is ToolPart {
  return part.type.startsWith('tool-')
}

function getStepStatus(
  part: ToolPart
): 'running' | 'error' | undefined {
  if (part.state === 'output-available') {
    return undefined
  }

  if (
    part.state === 'output-error' ||
    part.state === 'output-denied'
  ) {
    return 'error'
  }

  return 'running'
}

function describeStep(
  part: ToolPart
): string | undefined {
  if (part.type === 'tool-getWeather') {
    if (part.state === 'output-available') {
      return part.output.success
        ? `${part.output.city} · ${part.output.weather} · ${part.output.temperature}°C`
        : part.output.message
    }

    if (part.state === 'output-error') {
      return part.errorText
    }

    return part.input?.city
  }

  if (part.type === 'tool-getCurrentTime') {
    if (part.state === 'output-available') {
      return part.output.currentTime
    }

    if (part.state === 'output-error') {
      return part.errorText
    }

    return part.input?.timezone
  }

  if (part.type === 'tool-calculator') {
    if (part.state === 'output-available') {
      return 'error' in part.output
        ? part.output.error
        : `结果：${part.output.result}`
    }

    if (part.state === 'output-error') {
      return part.errorText
    }

    const { a, b, operation } = part.input ?? {}

    if (
      a === undefined ||
      b === undefined ||
      operation === undefined
    ) {
      return undefined
    }

    return `${a} ${OPERATION_SYMBOLS[operation]} ${b}`
  }

  if (part.type === 'tool-getUserInfo') {
    if (part.state === 'output-available') {
      return `${part.output.user.name} · ${part.output.user.age} 岁`
    }

    if (part.state === 'output-error') {
      return part.errorText
    }

    return undefined
  }

  if (part.state === 'output-available') {
    return `工单 ${part.output.ticketId}`
  }

  if (part.state === 'output-denied') {
    return '用户拒绝创建工单'
  }

  if (part.state === 'output-error') {
    return part.errorText
  }

  if (part.state === 'approval-requested') {
    return '等待确认'
  }

  return '准备创建工单'
}

interface ChainOfThoughtProps {
  parts: ChatUIMessage['parts']
}

function ChainOfThought({
  parts
}: ChainOfThoughtProps) {
  const [open, setOpen] = useState<
    boolean | undefined
  >(undefined)

  const steps = parts.filter(isToolPart)

  if (steps.length === 0) {
    return null
  }

  const running = steps.some(
    step => getStepStatus(step) === 'running'
  )

  const failed = steps.filter(
    step => getStepStatus(step) === 'error'
  ).length

  const title = running
    ? `正在执行 ${steps.length} 个步骤`
    : failed > 0
      ? `执行了 ${steps.length} 个步骤，${failed} 个失败`
      : `已完成 ${steps.length} 个步骤`

  const status = running
    ? 'running'
    : failed > 0
      ? 'error'
      : undefined

  return (
    <Trace>
      <TraceCollapsible
        open={open ?? running}
        onOpenChange={setOpen}
      >
        <TraceCollapsibleTrigger>
          <TraceLine status={status}>
            <TraceIcon>
              <Brain />
            </TraceIcon>

            <TraceTitle>{title}</TraceTitle>
          </TraceLine>
        </TraceCollapsibleTrigger>

        <TraceCollapsibleContent keepMounted>
          <Trace>
            {steps.map(step => {
              const Icon = TOOL_ICONS[step.type]

              return (
                <TraceLine
                  key={step.toolCallId}
                  status={getStepStatus(step)}
                >
                  <TraceIcon>
                    <Icon />
                  </TraceIcon>

                  <TraceTitle>
                    {TOOL_LABELS[step.type]}
                  </TraceTitle>

                  <TraceDescription>
                    {describeStep(step)}
                  </TraceDescription>
                </TraceLine>
              )
            })}
          </Trace>
        </TraceCollapsibleContent>
      </TraceCollapsible>
    </Trace>
  )
}

export default ChainOfThought
