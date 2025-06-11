import { describe, expect, it } from '@jest/globals'
import { Fn, float } from '../../src/index'

describe('関数定義テスト', () => {
        it('Fn関数の定義と呼び出し', () => {
                const fun = Fn(([position]) => {
                        return position.mul(2)
                })

                expect(fun.type).toBe('function')
                expect(fun.parameters).toHaveLength(1)
                expect(fun.body).toBeDefined()
        })

        it('関数の引数処理', () => {
                const fun = Fn(([position, normal, uv]) => {
                        return position.add(normal)
                })

                expect(fun.parameters).toHaveLength(3)
                expect(fun.parameters[0]).toBe('position')
                expect(fun.parameters[1]).toBe('normal')
                expect(fun.parameters[2]).toBe('uv')
        })

        it('関数の戻り値処理', () => {
                const fun = Fn(([input]) => {
                        const result = input.mul(2).add(1)
                        return result
                })

                const inputNode = float(5)
                const output = fun(inputNode)

                expect(output.type).toBe('functionCall')
                expect(output.function).toBe(fun)
                expect(output.arguments).toEqual([inputNode])
        })

        it('関数の再利用性', () => {
                const fun = Fn(([value, scale]) => {
                        return value.mul(scale)
                })

                const input1 = float(2)
                const input2 = float(3)
                const scale = float(10)

                const result1 = fun(input1, scale)
                const result2 = fun(input2, scale)

                expect(result1.function).toBe(fun)
                expect(result2.function).toBe(fun)
                expect(result1.id).not.toBe(result2.id)
        })

        it('関数の独立性', () => {
                const fun1 = Fn(([x]) => x.mul(2))
                const fun2 = Fn(([x]) => x.mul(3))
                expect(fun1.id).not.toBe(fun2.id)
                expect(fun1.body).not.toBe(fun2.body)
        })
})
