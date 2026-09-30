import { describe, expect, it } from 'vitest'

import { createRunId } from '../utils/run-id.js'
import {
    addAgentStep,
    createAgentTrace,
    finishAgentTrace
} from './trace.js'

describe('agent trace', () => {
    it('creates a trace with a run id', () => {
        const trace = createAgentTrace({
            runId: createRunId(),
            userId: 'u1',
            conversationId: 'c1'
        })

        expect(trace.runId).toMatch(/^run_/)
        expect(trace.userId).toBe('u1')
        expect(trace.conversationId).toBe('c1')
        expect(trace.steps).toEqual([])
    })

    it('accumulates steps and finishes with a reason', () => {
        const trace = createAgentTrace({
            runId: createRunId(),
            userId: 'u1',
            conversationId: 'c1'
        })

        addAgentStep(trace, {
            index: 0,
            type: 'model',
            startedAt: 1,
            finishedAt: 2
        })

        addAgentStep(trace, {
            index: 1,
            type: 'tool',
            toolName: 'getWeather',
            startedAt: 2,
            finishedAt: 3
        })

        finishAgentTrace(trace, { finishReason: 'stop' })

        expect(trace.steps).toHaveLength(2)
        expect(trace.steps[1].toolName).toBe('getWeather')
        expect(trace.finishReason).toBe('stop')
        expect(trace.finishedAt).toBeDefined()
    })

    it('records an error on finish', () => {
        const trace = createAgentTrace({
            runId: createRunId(),
            userId: 'u1',
            conversationId: 'c1'
        })

        finishAgentTrace(trace, {
            finishReason: 'error',
            error: 'boom'
        })

        expect(trace.error).toBe('boom')
    })

    it('records token usage on finish', () => {
        const trace = createAgentTrace({
            runId: createRunId(),
            userId: 'u1',
            conversationId: 'c1'
        })

        finishAgentTrace(trace, {
            finishReason: 'stop',
            usage: {
                inputTokens: 10,
                outputTokens: 20,
                totalTokens: 30
            }
        })

        expect(trace.usage?.totalTokens).toBe(30)
        expect(trace.usage?.inputTokens).toBe(10)
    })
})
