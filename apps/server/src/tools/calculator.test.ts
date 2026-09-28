import { describe, expect, it } from 'vitest'

import { calculate } from './calculator.js'

describe('calculate', () => {
    it('performs addition', () => {
        expect(calculate(1, 2, 'add')).toEqual({
            result: 3
        })
    })

    it('performs subtraction', () => {
        expect(calculate(5, 3, 'subtract')).toEqual({
            result: 2
        })
    })

    it('performs multiplication', () => {
        expect(calculate(4, 3, 'multiply')).toEqual({
            result: 12
        })
    })

    it('performs division', () => {
        expect(calculate(9, 3, 'divide')).toEqual({
            result: 3
        })
    })

    it('rejects division by zero', () => {
        expect(calculate(1, 0, 'divide')).toEqual({
            error: '除数不能为 0'
        })
    })
})
