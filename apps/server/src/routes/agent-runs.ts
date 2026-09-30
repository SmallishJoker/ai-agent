import type { FastifyInstance } from 'fastify'

import { getAgentTrace } from '../services/agent-trace.js'

export async function agentRunRoutes(
    app: FastifyInstance
) {
    app.get(
        '/api/agent-runs/:runId',
        async (request, reply) => {
            const { runId } = request.params as {
                runId: string
            }

            const trace = await getAgentTrace(runId)

            if (!trace) {
                return reply.status(404).send({
                    message: 'Agent run not found'
                })
            }

            return trace
        }
    )
}