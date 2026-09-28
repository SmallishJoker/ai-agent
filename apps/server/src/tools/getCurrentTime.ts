import { tool } from 'ai'
import { z } from 'zod'

export const getCurrentTime = tool({
  description: '获取当前服务器的日期和时间',

  inputSchema: z.object({
    timezone: z
      .string()
      .describe('时区，例如 Asia/Taipei、Asia/Shanghai')
  }),

  execute: async ({ timezone }) => {
    const time = new Intl.DateTimeFormat('zh-CN', {
      timeZone: timezone,
      dateStyle: 'full',
      timeStyle: 'long'
    }).format(new Date())

    return {
      timezone,
      currentTime: time
    }
  }
})