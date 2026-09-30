import type { ToolSet } from 'ai'

import { executeToolSafely } from '../agent/tool-executor.js'

import { calculator } from './calculator.js'
import { createTicket } from './createTicket.js'
import { getCurrentTime } from './getCurrentTime.js'
import { getUserInfo } from './getUserInfo.js'
import { getWeather } from './getWeather.js'

type LooseExecute = (
    ...args: any[]
) => Promise<unknown>

function withSafeExecution<T extends ToolSet>(
    definitions: T
): T {
    return Object.fromEntries(
        Object.entries(definitions).map(
            ([name, definition]) => {
                const execute = (
                    definition as {
                        execute?: LooseExecute
                    }
                ).execute

                if (!execute) {
                    return [name, definition]
                }

                return [
                    name,
                    {
                        ...definition,

                        execute: async (
                            ...args: any[]
                        ) => {
                            const outcome =
                                await executeToolSafely(
                                    name,
                                    () => execute(...args)
                                )

                            if (!outcome.success) {
                                throw new Error(
                                    outcome.error
                                )
                            }

                            return outcome.result
                        }
                    }
                ]
            }
        )
    ) as T
}

export const tools = withSafeExecution({
    getCurrentTime,
    calculator,
    getWeather,
    createTicket,
    getUserInfo
})

export {
    getCurrentTime,
    calculator,
    getWeather,
    createTicket,
    getUserInfo
}
