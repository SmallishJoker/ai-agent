import { get } from './api'

import type { AgentTraceResponse } from '@/types/chat'

export function getAgentTrace(runId: string) {
    return get<AgentTraceResponse>(
        `/api/agent-runs/${encodeURIComponent(runId)}`
    )
}
