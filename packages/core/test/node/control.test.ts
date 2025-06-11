import { describe, expect, it } from '@jest/globals'
import { If, float, bool } from '../../src/index'

describe('条件分岐テスト', () => {
        it('If文の基本動作', () => {
                const condition = bool(true)
                const _if = If(condition, () => {
                        return float(1)
                })

                expect(_if.type).toBe('if')
                expect(_if.condition).toBe(condition)
                expect(_if.thenBranch).toBeDefined()
        })

        it('ElseIf文の動作', () => {
                const condition1 = bool(false)
                const condition2 = bool(true)

                const _if = If(condition1, () => {
                        return float(1)
                }).ElseIf(condition2, () => {
                        return float(2)
                })

                expect(_if.type).toBe('if')
                expect(_if.elseIfBranches).toHaveLength(1)
                expect(_if.elseIfBranches[0].condition).toBe(condition2)
        })

        it('Else文の動作', () => {
                const condition = bool(false)

                const _if = If(condition, () => {
                        return float(1)
                }).Else(() => {
                        return float(0)
                })

                expect(_if.type).toBe('if')
                expect(_if.elseBranch).toBeDefined()
        })

        it('ノード変数を使用した条件式', () => {
                const x = float(10)
                const y = float(20)
                const condition = x.lessThan(y)

                const _if = If(condition, () => {
                        return x.add(1)
                })

                expect(_if.condition).toBe(condition)
                expect(_if.condition.type).toBe('bool')
                expect(_if.condition.operation).toBe('lessThan')
        })

        it('複雑な条件分岐の構造', () => {
                const x = float(5)
                const condition1 = x.greaterThan(float(10))
                const condition2 = x.lessThan(float(0))

                const _if = If(condition1, () => {
                        return float(1)
                })
                        .ElseIf(condition2, () => {
                                return float(-1)
                        })
                        .Else(() => {
                                return float(0)
                        })

                expect(_if.type).toBe('if')
                expect(_if.condition).toBe(condition1)
                expect(_if.elseIfBranches).toHaveLength(1)
                expect(_if.elseBranch).toBeDefined()
        })
})
