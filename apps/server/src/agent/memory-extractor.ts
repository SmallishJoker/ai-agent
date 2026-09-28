import { generateObject } from 'ai'
import { z } from 'zod'

import { chatModel } from '../config/ai.js'

export const memoryExtractionSchema = z.object({
    shouldRemember: z.boolean(),

    memories: z.array(
        z.object({
            content: z.string(),

            type: z.enum([
                'preference',
                'profile',
                'project',
                'habit',
                'other'
            ]),

            importance: z
                .number()
                .int()
                .min(1)
                .max(5)
        })
    )
})

export interface ExtractUserMemoriesInput {
    transcript: string
    existingMemories: string[]
}

export async function extractUserMemories({
    transcript,
    existingMemories
}: ExtractUserMemoriesInput) {
    const { object } = await generateObject({
        model: chatModel,
        schema: memoryExtractionSchema,

        system: `
你负责从对话中抽取值得长期记住的用户信息。

只抽取稳定、可复用的信息，例如：
- 用户的身份、称呼、所在地
- 用户的偏好与习惯
- 用户正在进行的项目或长期目标
- 用户明确表达的约束

不要抽取：
- 一次性的闲聊
- 已经在「已有记忆」中出现过的信息
- 无法确认的推测

如果没有值得记住的信息，返回 shouldRemember=false 且 memories 为空数组。
每条记忆用一句简洁的中文陈述，importance 取 1-5。
`,

        prompt: `
【已有记忆】
${existingMemories.length > 0
                ? existingMemories
                    .map(memory => `- ${memory}`)
                    .join('\n')
                : '（无）'
            }

【新增对话】
${transcript}
`
    })

    return object
}