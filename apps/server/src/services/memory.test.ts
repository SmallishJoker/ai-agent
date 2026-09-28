import { describe, expect, it } from 'vitest'

import { computeSummaryBoundary } from './memory.js'

describe('computeSummaryBoundary', () => {
    it('returns null when not enough new messages', () => {
        expect(
            computeSummaryBoundary({
                total: 15,
                summarizedCount: 0,
                recentLimit: 10,
                batchSize: 10
            })
        ).toBeNull()
    })

    it('returns the boundary when batch is full', () => {
        expect(
            computeSummaryBoundary({
                total: 25,
                summarizedCount: 0,
                recentLimit: 10,
                batchSize: 10
            })
        ).toBe(15)
    })

    it('accounts for previously summarized messages', () => {
        expect(
            computeSummaryBoundary({
                total: 40,
                summarizedCount: 15,
                recentLimit: 10,
                batchSize: 10
            })
        ).toBe(30)
    })

    it('returns null when the new batch is too small', () => {
        expect(
            computeSummaryBoundary({
                total: 30,
                summarizedCount: 15,
                recentLimit: 10,
                batchSize: 10
            })
        ).toBeNull()
    })
})
