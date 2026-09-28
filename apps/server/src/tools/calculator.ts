import { tool } from 'ai'
import { z } from 'zod'

export type CalculatorOperation =
    | 'add'
    | 'subtract'
    | 'multiply'
    | 'divide'

export function calculate(
    a: number,
    b: number,
    operation: CalculatorOperation
):
    | { result: number }
    | { error: string } {
    switch (operation) {
        case 'add':
            return { result: a + b }

        case 'subtract':
            return { result: a - b }

        case 'multiply':
            return { result: a * b }

        case 'divide':
            if (b === 0) {
                return { error: '除数不能为 0' }
            }

            return { result: a / b }
    }
}

export const calculator = tool({
    description:
        '执行简单的数学计算，例如加减乘除和数字比较',

    inputSchema: z.object({
        a: z.number(),
        b: z.number(),

        operation: z.enum([
            'add',
            'subtract',
            'multiply',
            'divide'
        ])
    }),

    execute: async ({ a, b, operation }) =>
        calculate(a, b, operation)
})
