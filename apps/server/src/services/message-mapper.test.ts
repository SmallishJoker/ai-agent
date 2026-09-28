import { describe, expect, it } from 'vitest'

import type { UIMessage } from 'ai'

import {
    databaseMessageToUIMessage,
    uiMessageToDatabase
} from './message-mapper.js'

describe('databaseMessageToUIMessage', () => {
    it('uses parts when available', () => {
        const message = databaseMessageToUIMessage({
            id: 'm1',
            role: 'assistant',
            content: 'hello',
            parts: [{ type: 'text', text: 'hello' }]
        })

        expect(message).toEqual({
            id: 'm1',
            role: 'assistant',
            parts: [{ type: 'text', text: 'hello' }]
        })
    })

    it('falls back to content when parts is missing', () => {
        const message = databaseMessageToUIMessage({
            id: 'm2',
            role: 'user',
            content: 'hi there',
            parts: null
        })

        expect(message.parts).toEqual([
            { type: 'text', text: 'hi there' }
        ])
    })

    it('returns empty parts when content is empty', () => {
        const message = databaseMessageToUIMessage({
            id: 'm3',
            role: 'user',
            content: null,
            parts: null
        })

        expect(message.parts).toEqual([])
    })
})

describe('uiMessageToDatabase', () => {
    it('joins text parts into content', () => {
        const message = {
            id: 'm4',
            role: 'assistant',
            parts: [
                { type: 'text', text: 'foo' },
                { type: 'text', text: 'bar' }
            ]
        } as unknown as UIMessage

        const row = uiMessageToDatabase(message)

        expect(row).toEqual({
            id: 'm4',
            role: 'assistant',
            content: 'foobar',
            parts: message.parts
        })
    })

    it('stores null content when there is no text', () => {
        const message = {
            id: 'm5',
            role: 'assistant',
            parts: [{ type: 'tool-getWeather' }]
        } as unknown as UIMessage

        const row = uiMessageToDatabase(message)

        expect(row.content).toBeNull()
    })
})
