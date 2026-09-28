import { generateText } from 'ai'
import { chatModel } from '../config/ai.js'

export interface SummarizeInput {
    previousSummary?: string | null
    transcript: string
}

export async function generateConversationSummary({
    previousSummary,
    transcript
}: SummarizeInput) {
    const result = await generateText({
        model: chatModel,

        system: `
你负责维护一个 AI 对话的长期记忆摘要。

请把「已有摘要」和「新增对话」合并，输出一份更新后的摘要。

摘要需要保留：
1. 用户的重要信息（身份、偏好、约束）
2. 用户正在做的事情
3. 已经完成的事情
4. 当前未完成的问题
5. 对后续对话有价值的上下文

要求：
- 使用简洁的中文条目
- 不要记录无关的闲聊
- 不要编造不存在的信息
- 如果已有摘要与新增对话冲突，以新增对话为准
`,

        prompt: `
【已有摘要】
${previousSummary?.trim() || '（无）'}

【新增对话】
${transcript}
`
    })

    return result.text.trim()
}
