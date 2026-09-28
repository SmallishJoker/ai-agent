import { z } from 'zod'

export const createConversationSchema = z.object({
    userId: z.string().min(1),
    title: z.string().min(1).optional()
})

export const userIdQuerySchema = z.object({
    userId: z.string().min(1)
})
