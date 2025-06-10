import { describe, expect, it } from '@jest/globals'
import { uniform } from '../../node/index'

describe('ユニフォーム変数テスト', () => {
        it('ユニフォーム変数の作成', () => {
                const f = uniform(1.5)
                expect(f.type).toBe('uniform')
                expect(f.value).toBe(1.5)
                expect(f.uniformType).toBe('float')
        })

        it('ベクトルユニフォームの作成', () => {
                const uniformVec = uniform([1, 2, 3])
                expect(uniformVec.type).toBe('uniform')
                expect(uniformVec.value).toEqual([1, 2, 3])
                expect(uniformVec.uniformType).toBe('vec3')
        })

        it('値の更新機能', () => {
                const uniformValue = uniform(10)

                expect(uniformValue.value).toBe(10)

                uniformValue.set(20)
                expect(uniformValue.value).toBe(20)
        })

        it('ユニフォーム名の生成', () => {
                const uniform1 = uniform(1)
                const uniform2 = uniform(2)

                expect(uniform1.name).toBeDefined()
                expect(uniform2.name).toBeDefined()
                expect(uniform1.name).not.toBe(uniform2.name)
        })

        it('シェーダーコードへの反映', () => {
                const uniformValue = uniform(5.0)

                expect(uniformValue.toGLSL()).toContain('uniform')
                expect(uniformValue.toGLSL()).toContain('float')
                expect(uniformValue.toGLSL()).toContain(uniformValue.name)
        })

        it('複数の型のユニフォーム', () => {
                const floatUniform = uniform(1.0)
                const vec3Uniform = uniform([1, 2, 3])
                const boolUniform = uniform(true)

                expect(floatUniform.uniformType).toBe('float')
                expect(vec3Uniform.uniformType).toBe('vec3')
                expect(boolUniform.uniformType).toBe('bool')
        })

        it('ユニフォームの演算', () => {
                const uniform1 = uniform(2.0)
                const uniform2 = uniform(3.0)

                const result = uniform1.add(uniform2)

                expect(result.type).toBe('float')
                expect(result.operation).toBe('add')
                expect(result.operands).toEqual([uniform1, uniform2])
        })
})
