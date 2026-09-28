import { tool } from 'ai'
import { z } from 'zod'

const weatherData: Record<
    string,
    {
        temperature: number
        weather: string
    }
> = {
    北京: {
        temperature: 8,
        weather: '小雨'
    },

    上海: {
        temperature: 24,
        weather: '多云'
    },

    广州: {
        temperature: 30,
        weather: '晴'
    }
}

export const getWeather = tool({
    description:
        '查询指定城市当前的天气和温度',

    inputSchema: z.object({
        city: z
            .string()
            .describe('要查询天气的城市')
    }),

    execute: async ({ city }) => {
        const weather =
            weatherData[city]

        if (!weather) {
            return {
                success: false,
                city,
                message:
                    `暂时没有 ${city} 的天气数据`
            }
        }

        return {
            success: true,
            city,
            ...weather
        }
    }
})