import { useEffect, useState } from 'react'

import { getAgentTrace } from '@/services/agent-trace'
import type { AgentTraceResponse } from '@/types/chat'

interface AgentTraceProps {
  runId: string
}

type TraceState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'done'; trace: AgentTraceResponse }

export default function AgentTrace({
  runId
}: AgentTraceProps) {
  const [state, setState] =
    useState<TraceState>({ status: 'loading' })

  useEffect(() => {
    let active = true

    getAgentTrace(runId)
      .then(result => {
        if (active) {
          setState({ status: 'done', trace: result })
        }
      })
      .catch(fetchError => {
        if (active) {
          setState({
            status: 'error',
            message:
              fetchError instanceof Error
                ? fetchError.message
                : 'Failed to load agent trace'
          })
        }
      })

    return () => {
      active = false
    }
  }, [runId])

  if (state.status === 'loading') {
    return (
      <div className="p-4 text-sm text-muted-foreground">
        Loading agent trace...
      </div>
    )
  }

  if (state.status === 'error') {
    return (
      <div className="p-4 text-sm text-destructive">
        {state.message}
      </div>
    )
  }

  const { run, steps } = state.trace

  return (
    <div className="space-y-4">
      <div>
        <div className="text-sm font-medium">
          Agent Run
        </div>

        <div className="mt-1 text-xs text-muted-foreground">
          {run.runId}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <div className="text-xs text-muted-foreground">
            Status
          </div>

          <div
            className={
              run.status === 'failed'
                ? 'text-sm text-destructive'
                : 'text-sm text-emerald-600'
            }
          >
            {run.status}
          </div>
        </div>

        <div>
          <div className="text-xs text-muted-foreground">
            Finish reason
          </div>

          <div className="text-sm">
            {run.finishReason ?? '-'}
          </div>
        </div>

        <div>
          <div className="text-xs text-muted-foreground">
            Duration
          </div>

          <div className="text-sm">
            {run.durationMs ?? '-'} ms
          </div>
        </div>

        <div>
          <div className="text-xs text-muted-foreground">
            Steps
          </div>

          <div className="text-sm">
            {steps.length}
          </div>
        </div>

        <div>
          <div className="text-xs text-muted-foreground">
            Tokens
          </div>

          <div className="text-sm">
            {run.totalTokens ?? '-'}
          </div>
        </div>

        <div>
          <div className="text-xs text-muted-foreground">
            User
          </div>

          <div className="truncate text-sm">
            {run.userId}
          </div>
        </div>
      </div>

      {run.error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
          {run.error}
        </div>
      )}

      <div className="space-y-2">
        {steps.map(step => (
          <div
            key={step.id}
            className="rounded-lg border p-3"
          >
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium">
                Step {step.stepIndex + 1}
              </div>

              <div className="text-xs text-muted-foreground">
                {step.durationMs ?? '-'} ms
              </div>
            </div>

            <div className="mt-1 text-xs text-muted-foreground">
              {step.type}
              {step.name ? ` · ${step.name}` : ''}
            </div>

            {step.error && (
              <div className="mt-1 text-xs text-destructive">
                {step.error}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
