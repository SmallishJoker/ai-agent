import type { FastifyPluginAsync } from 'fastify'

import { agentRunRoutes } from './agent-runs.js'
import { chatRoutes } from './chat.js'
import { conversationRoutes } from './conversations.js'
import { healthRoutes } from './health.js'

export const registerRoutes: FastifyPluginAsync =
    async app => {
        await app.register(healthRoutes)
        await app.register(chatRoutes)
        await app.register(conversationRoutes)
        await app.register(agentRunRoutes)
    }
