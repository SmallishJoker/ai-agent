import type { UIMessage } from 'ai'

import { memoryConfig } from '../config/memory.js'

import { extractUserMemories } from '../agent/memory-extractor.js'

import {
    createUserMemory,
    findUserMemories,
    findUserMemoryByContent,
    updateUserMemory
} from '../repositories/memory.repository.js'

function renderMessage(message: UIMessage) {
    const text = message.parts
        .filter(part => part.type === 'text')
        .map(part => part.text)
        .join('')
        .trim()

    return `${message.role}: ${
        text.length > 0 ? text : '[非文本内容]'
    }`
}

export async function getUserMemories(userId: string) {
    return findUserMemories(
        userId,
        memoryConfig.userMemoryLimit
    )
}

export async function saveUserMemory(data: {
    userId: string
    content: string
    type: string
    importance?: number
}) {
    return createUserMemory(data)
}

export async function extractAndSaveUserMemories({
    userId,
    transcript
}: {
    userId: string
    transcript: string
}) {
    if (transcript.trim().length === 0) {
        return []
    }

    const existing = await findUserMemories(
        userId,
        memoryConfig.userMemoryLimit
    )

    const result = await extractUserMemories({
        transcript,
        existingMemories: existing.map(
            memory => memory.content
        )
    })

    if (
        !result.shouldRemember ||
        result.memories.length === 0
    ) {
        return []
    }

    const saved = []

    for (const memory of result.memories) {
        const content = memory.content.trim()

        if (content.length === 0) {
            continue
        }

        const duplicate =
            await findUserMemoryByContent(
                userId,
                content
            )

        if (duplicate) {
            saved.push(
                await updateUserMemory(duplicate.id, {
                    importance: memory.importance
                })
            )

            continue
        }

        saved.push(
            await saveUserMemory({
                userId,
                content,
                type: memory.type,
                importance: memory.importance
            })
        )
    }

    return saved
}

export async function updateUserMemoryFromMessages(
    userId: string,
    messages: UIMessage[]
) {
    const recent = messages.slice(-4)

    const transcript = recent
        .map(renderMessage)
        .join('\n')

    return extractAndSaveUserMemories({
        userId,
        transcript
    })
}
