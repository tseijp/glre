import { describe, expect, it } from '@jest/globals'
import { Fn, float } from '../../index'

describe('関数定義テスト', () => {
        it('Fn関数の定義と呼び出し', () => {
                const testFn = Fn(([position]) => {
                        return position.mul(2)
                })

                expect(testFn.type).toBe('function')
                expect(testFn.parameters).toHaveLength(1)
                expect(testFn.body).toBeDefined()
        })

        it('関数の引数処理', () => {
                const multiArgFn = Fn(([position, normal, uv]) => {
                        return position.add(normal)
                })

                expect(multiArgFn.parameters).toHaveLength(3)
                expect(multiArgFn.parameters[0]).toBe('position')
                expect(multiArgFn.parameters[1]).toBe('normal')
                expect(multiArgFn.parameters[2]).toBe('uv')
        })

        it('関数の戻り値処理', () => {
                const returnFn = Fn(([input]) => {
                        const result = input.mul(2).add(1)
                        return result
                })

                const inputNode = float(5)
                const output = returnFn(inputNode)

                expect(output.type).toBe('functionCall')
                expect(output.function).toBe(returnFn)
                expect(output.arguments).toEqual([inputNode])
        })

        it('関数の再利用性', () => {
                const scaleFn = Fn(([value, scale]) => {
                        return value.mul(scale)
                })

                const input1 = float(2)
                const input2 = float(3)
                const scale = float(10)

                const result1 = scaleFn(input1, scale)
                const result2 = scaleFn(input2, scale)

                expect(result1.function).toBe(scaleFn)
                expect(result2.function).toBe(scaleFn)
                expect(result1.id).not.toBe(result2.id)
        })

        it('関数の独立性', () => {
                const fn1 = Fn(([x]) => x.mul(2))
                const fn2 = Fn(([x]) => x.mul(3))

                expect(fn1.id).not.toBe(fn2.id)
                expect(fn1.body).not.toBe(fn2.body)
        })
})
