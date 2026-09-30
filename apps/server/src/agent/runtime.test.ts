import { describe, expect, it } from 'vitest'

import { maxToolCallsIs } from './runtime.js'

function stepWithToolCalls(count: number) {
    return {
        toolCalls: new Array(count).fill({})
    }
}

type StopOptions = Parameters<
    ReturnType<typeof maxToolCallsIs>
>[0]

function options(steps: number[]): StopOptions {
    return {
        steps: steps.map(stepWithToolCalls)
    } as unknown as StopOptions
}

describe('maxToolCallsIs', () => {
    it('does not stop while under the limit', () => {
        expect(
            maxToolCallsIs(3)(options([1, 1]))
        ).toBe(false)
    })

    it('stops once the limit is reached', () => {
        expect(
            maxToolCallsIs(3)(options([2, 1]))
        ).toBe(true)
    })

    it('counts tool calls across steps', () => {
        expect(
            maxToolCallsIs(5)(options([2, 2]))
        ).toBe(false)

        expect(
            maxToolCallsIs(5)(options([2, 3]))
        ).toBe(true)
    })
})
