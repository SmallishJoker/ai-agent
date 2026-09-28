import type { FastifyPluginAsync } from 'fastify'

export const healthRoutes: FastifyPluginAsync = async app => {
    app.get('/api/health', async () => {
        return {
            success: true,
            message: 'Backend is running.'
        }
    })
}
