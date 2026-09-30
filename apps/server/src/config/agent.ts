import 'dotenv/config'

import type { AgentBudget } from '../agent/types.js'
import { toPositiveInt } from './env.js'

export const agentConfig: AgentBudget = {
    maxSteps: toPositiveInt(
        process.env.AGENT_MAX_STEPS,
        5
    ),

    maxToolCalls: toPositiveInt(
        process.env.AGENT_MAX_TOOL_CALLS,
        10
    )
}
