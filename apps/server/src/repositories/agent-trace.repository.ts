import { eq, asc } from 'drizzle-orm'
import { db } from '../db/index.js'
import { agentRuns, agentSteps } from '../db/schema.js'

export async function createAgentRun(data: {
    runId: string
    userId: string
    conversationId: string
}) {
    const [run] = await db
        .insert(agentRuns)
        .values({
            runId: data.runId,
            userId: data.userId,
            conversationId: data.conversationId,
            status: 'running'
        })
        .returning()

    return run
}

export async function finishAgentRun(
    runId: string,
    data: {
        status: 'completed' | 'failed'
        finishReason?: string
        durationMs?: number
        inputTokens?: number
        outputTokens?: number
        totalTokens?: number
        error?: string
    }
) {
    const [run] = await db
        .update(agentRuns)
        .set({
            status: data.status,
            finishReason: data.finishReason,
            finishedAt: new Date(),
            durationMs: data.durationMs,
            inputTokens: data.inputTokens,
            outputTokens: data.outputTokens,
            totalTokens: data.totalTokens,
            error: data.error
        })
        .where(eq(agentRuns.runId, runId))
        .returning()

    return run
}

export async function createAgentStep(data: {
    runId: string
    stepIndex: number
    type: string
    name?: string
    startedAt: Date
    finishedAt?: Date
    durationMs?: number
    input?: unknown
    output?: unknown
    error?: string
}) {
    const [step] = await db
        .insert(agentSteps)
        .values({
            runId: data.runId,
            stepIndex: data.stepIndex,
            type: data.type,
            name: data.name,
            startedAt: data.startedAt,
            finishedAt: data.finishedAt,
            durationMs: data.durationMs,
            input: data.input,
            output: data.output,
            error: data.error
        })
        .returning()

    return step
}

export async function findAgentTrace(runId: string) {
    const [run] = await db
        .select()
        .from(agentRuns)
        .where(eq(agentRuns.runId, runId))
        .limit(1)

    if (!run) {
        return null
    }

    const steps = await db
        .select()
        .from(agentSteps)
        .where(eq(agentSteps.runId, run.runId))
        .orderBy(asc(agentSteps.stepIndex))

    return {
        run,
        steps
    }
}