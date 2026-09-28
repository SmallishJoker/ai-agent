import { z } from 'zod'

export const chatRequestSchema = z.object({
    conversationId: z.string().min(1),
    messages: z.array(z.any()),
    userId: z.string().min(1)
})
