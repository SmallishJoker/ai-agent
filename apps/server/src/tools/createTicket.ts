import { tool } from 'ai'
import { z } from 'zod'

export const createTicket = tool({
    description:
        '创建一个车辆相关的维修或故障工单（演示用：仅返回模拟工单号，不会真正写入业务系统）',

    inputSchema: z.object({
        title: z
            .string()
            .describe('工单标题'),

        description: z
            .string()
            .describe('故障详细描述'),

        priority: z
            .enum([
                'low',
                'medium',
                'high'
            ])
            .describe('工单优先级')
    }),

    needsApproval: true,

    execute: async ({
        title,
        description,
        priority
    }) => {
        await new Promise(resolve =>
            setTimeout(resolve, 1000)
        )

        const ticketId =
            `TICKET-${Date.now()}`

        return {
            success: true,
            demo: true,
            ticketId,
            title,
            description,
            priority
        }
    }
})