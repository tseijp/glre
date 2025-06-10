import { describe, expect, it } from '@jest/globals'
import { If, float, bool } from '../../index'

describe('条件分岐テスト', () => {
        it('If文の基本動作', () => {
                const condition = bool(true)
                const ifNode = If(condition, () => {
                        return float(1)
                })

                expect(ifNode.type).toBe('if')
                expect(ifNode.condition).toBe(condition)
                expect(ifNode.thenBranch).toBeDefined()
        })

        it('ElseIf文の動作', () => {
                const condition1 = bool(false)
                const condition2 = bool(true)

                const ifNode = If(condition1, () => {
                        return float(1)
                }).ElseIf(condition2, () => {
                        return float(2)
                })

                expect(ifNode.type).toBe('if')
                expect(ifNode.elseIfBranches).toHaveLength(1)
                expect(ifNode.elseIfBranches[0].condition).toBe(condition2)
        })

        it('Else文の動作', () => {
                const condition = bool(false)

                const ifNode = If(condition, () => {
                        return float(1)
                }).Else(() => {
                        return float(0)
                })

                expect(ifNode.type).toBe('if')
                expect(ifNode.elseBranch).toBeDefined()
        })

        it('ノード変数を使用した条件式', () => {
                const x = float(10)
                const y = float(20)
                const condition = x.lessThan(y)

                const ifNode = If(condition, () => {
                        return x.add(1)
                })

                expect(ifNode.condition).toBe(condition)
                expect(ifNode.condition.type).toBe('bool')
                expect(ifNode.condition.operation).toBe('lessThan')
        })

        it('複雑な条件分岐の構造', () => {
                const x = float(5)
                const condition1 = x.greaterThan(float(10))
                const condition2 = x.lessThan(float(0))

                const ifNode = If(condition1, () => {
                        return float(1)
                })
                        .ElseIf(condition2, () => {
                                return float(-1)
                        })
                        .Else(() => {
                                return float(0)
                        })

                expect(ifNode.type).toBe('if')
                expect(ifNode.condition).toBe(condition1)
                expect(ifNode.elseIfBranches).toHaveLength(1)
                expect(ifNode.elseBranch).toBeDefined()
        })
})
