import { describe, it, expect } from '@jest/globals'
import { float, vec3, int, If, Loop, Fn } from '../../src/node'

describe('制御フロー', () => {
        describe('条件分岐（If/Else/ElseIf）', () => {
                it('基本的なIf文', () => {
                        const shader = Fn(() => {
                                const x = float(1).toVar()
                                const y = float(0).toVar()

                                If(x.greaterThan(float(0)), () => {
                                        y.assign(float(10))
                                })

                                return y
                        })

                        const result = shader()
                        expect(`${result}`).toContain('if')
                        expect(`${result}`).toContain('(1.0 > 0.0)')
                        expect(`${result}`).toContain('y = 10.0')
                })

                it('If-Else文', () => {
                        const shader = Fn(() => {
                                const x = float(1).toVar()
                                const result = vec3(0).toVar()

                                If(x.equal(float(1)), () => {
                                        result.assign(vec3(1, 0, 0))
                                }).Else(() => {
                                        result.assign(vec3(0, 1, 0))
                                })

                                return result
                        })

                        const code = `${shader()}`
                        expect(code).toContain('if')
                        expect(code).toContain('else')
                })

                it('If-ElseIf-Else文', () => {
                        const shader = Fn(() => {
                                const x = float(2).toVar()
                                const result = vec3(0).toVar()

                                If(x.lessThan(float(1)), () => {
                                        result.assign(vec3(1, 0, 0))
                                })
                                        .ElseIf(x.equal(float(2)), () => {
                                                result.assign(vec3(0, 1, 0))
                                        })
                                        .Else(() => {
                                                result.assign(vec3(0, 0, 1))
                                        })

                                return result
                        })

                        const code = `${shader()}`
                        expect(code).toContain('if')
                        expect(code).toContain('else if')
                        expect(code).toContain('else')
                })

                it('Else後のElseIf（未実装機能）', () => {
                        // 現在の実装ではElse後のElseIfは動作しない
                        const shader = Fn(() => {
                                const x = float(2).toVar()
                                const result = vec3(0).toVar()

                                const ifStatement = If(x.equal(float(0)), () => {
                                        result.assign(vec3(1, 0, 0))
                                }).Else(() => {
                                        result.assign(vec3(0, 1, 0))
                                })

                                // Else後のElseIfは現在未実装
                                // ifStatement.ElseIf は存在しない

                                return result
                        })

                        const code = `${shader()}`
                        expect(code).toContain('if')
                        expect(code).toContain('else')
                })
        })

        describe('ループ（Loop）', () => {
                it('基本的なループ', () => {
                        const shader = Fn(() => {
                                const sum = float(0).toVar()

                                Loop(int(10), ({ i }) => {
                                        sum.assign(sum.add(i))
                                })

                                return sum
                        })

                        const code = `${shader()}`
                        expect(code).toContain('for')
                        expect(code).toContain('i < 10')
                        expect(code).toContain('sum = (sum + i)')
                })

                it('ネストされたループ', () => {
                        const shader = Fn(() => {
                                const result = float(0).toVar()

                                Loop(int(3), ({ i }) => {
                                        Loop(int(3), ({ i: j }) => {
                                                result.assign(result.add(i.mul(j)))
                                        })
                                })

                                return result
                        })

                        const code = `${shader()}`
                        expect(code).toContain('for')
                        expect(code.match(/for/g)?.length).toBeGreaterThanOrEqual(2)
                })

                it('ループ内での条件分岐', () => {
                        const shader = Fn(() => {
                                const count = int(0).toVar()

                                Loop(int(10), ({ i }) => {
                                        If(i.mod(int(2)).equal(int(0)), () => {
                                                count.assign(count.add(int(1)))
                                        })
                                })

                                return count
                        })

                        const code = `${shader()}`
                        expect(code).toContain('for')
                        expect(code).toContain('if')
                        expect(code).toContain('mod')
                })
        })
})
