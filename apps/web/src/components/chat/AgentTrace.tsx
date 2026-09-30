import {
  Brain,
  CircleCheckBig,
  CircleX,
  Wrench
} from 'lucide-react'

import type { AgentStep } from '@/types/chat'

const stepLabels: Record<AgentStep['type'], string> = {
  model: '模型推理',
  tool: '工具调用',
  finish: '完成'
}

function StepIcon({
  type,
  error
}: {
  type: AgentStep['type']
  error?: string
}) {
  if (error) {
    return (
      <CircleX className="size-3.5 text-destructive" />
    )
  }

  if (type === 'tool') {
    return <Wrench className="size-3.5" />
  }

  if (type === 'finish') {
    return (
      <CircleCheckBig className="size-3.5 text-emerald-600" />
    )
  }

  return <Brain className="size-3.5" />
}

function AgentTrace({ steps }: { steps: AgentStep[] }) {
  if (steps.length === 0) {
    return null
  }

  return (
    <div className="my-3 rounded-xl border bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
      <div className="mb-1.5 font-medium text-foreground/80">
        运行轨迹
      </div>

      <ol className="space-y-1">
        {steps.map(step => (
          <li
            key={step.index}
            className="flex flex-wrap items-center gap-2"
          >
            <StepIcon type={step.type} error={step.error} />

            <span>{stepLabels[step.type]}</span>

            {step.toolName && (
              <code className="rounded bg-background px-1.5 py-0.5">
                {step.toolName}
              </code>
            )}

            {step.finishReason && (
              <span>（{step.finishReason}）</span>
            )}

            {step.error && (
              <span className="text-destructive">
                {step.error}
              </span>
            )}
          </li>
        ))}
      </ol>
    </div>
  )
}

export default AgentTrace
