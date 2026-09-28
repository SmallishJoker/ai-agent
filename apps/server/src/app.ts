import 'dotenv/config'
import Fastify from 'fastify'
import cors from '@fastify/cors'

import { registerRoutes } from './routes/index.js'

export function buildApp() {
    const app = Fastify({
        logger: process.env.NODE_ENV !== 'test'
    })

    app.register(cors, {
        origin: true
    })

    app.register(registerRoutes)

    return app
}
