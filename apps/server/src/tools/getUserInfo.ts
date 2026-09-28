import { tool } from 'ai'
import { z } from 'zod'

export const getUserInfo = tool({
    description: '获取当前登录用户的基本信息',

    inputSchema: z.object({}),

    execute: async () => ({
        success: true,
        user: {
            name: '张三',
            age: 18
        }
    })
})
