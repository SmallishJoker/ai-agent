import { afterAll, describe, expect, it } from 'vitest'

import { buildApp } from './app.js'

const app = buildApp()

afterAll(async () => {
    await app.close()
})

describe('buildApp', () => {
    it('responds to the health check', async () => {
        const response = await app.inject({
            method: 'GET',
            url: '/api/health'
        })

        expect(response.statusCode).toBe(200)

        expect(response.json()).toEqual({
            success: true,
            message: 'Backend is running.'
        })
    })

    it('rejects chat requests without a userId', async () => {
        const response = await app.inject({
            method: 'POST',
            url: '/api/chat',
            payload: {
                conversationId: 'x',
                messages: []
            }
        })

        expect(response.statusCode).toBe(400)

        expect(response.json().success).toBe(false)
    })
})
