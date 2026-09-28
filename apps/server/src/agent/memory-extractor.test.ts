import { describe, expect, it } from 'vitest'

import { memoryExtractionSchema } from './memory-extractor.js'

describe('memoryExtractionSchema', () => {
    it('accepts a valid extraction result', () => {
        const result = memoryExtractionSchema.safeParse({
            shouldRemember: true,
            memories: [
                {
                    content: '用户偏好简洁的回答',
                    type: 'preference',
                    importance: 3
                }
            ]
        })

        expect(result.success).toBe(true)
    })

    it('accepts an empty result', () => {
        const result = memoryExtractionSchema.safeParse({
            shouldRemember: false,
            memories: []
        })

        expect(result.success).toBe(true)
    })

    it('rejects an unknown memory type', () => {
        const result = memoryExtractionSchema.safeParse({
            shouldRemember: true,
            memories: [
                {
                    content: 'x',
                    type: 'unknown',
                    importance: 3
                }
            ]
        })

        expect(result.success).toBe(false)
    })

    it('rejects importance out of range', () => {
        const result = memoryExtractionSchema.safeParse({
            shouldRemember: true,
            memories: [
                {
                    content: 'x',
                    type: 'profile',
                    importance: 9
                }
            ]
        })

        expect(result.success).toBe(false)
    })
})
