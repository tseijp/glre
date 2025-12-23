import { describe, it, expect } from '@jest/globals'
import { infer, inferPrimitiveType } from '../../src/node/utils/infer'
import { float, int, uint, bool, vec2, vec3, vec4, mat2, mat3, mat4, ivec2, ivec3, ivec4, uvec2, uvec3, uvec4, bvec2, bvec3, bvec4 } from '../../src/node'

describe('Type Inference Engine', () => {
        describe('Primitive Type Inference', () => {
                it('should infer bool from boolean values', () => {
                        expect(inferPrimitiveType(true)).toBe('bool')
                        expect(inferPrimitiveType(false)).toBe('bool')
                })

                it('should infer float from number values', () => {
                        expect(inferPrimitiveType(42)).toBe('float')
                        expect(inferPrimitiveType(3.14159)).toBe('float')
                        expect(inferPrimitiveType(-1.5)).toBe('float')
                        expect(inferPrimitiveType(0)).toBe('float')
                })

                it('should infer texture from string values', () => {
                        expect(inferPrimitiveType('texture.png')).toBe('texture')
                        expect(inferPrimitiveType('')).toBe('texture')
                })

                it('should infer vector types from array length', () => {
                        expect(inferPrimitiveType([1])).toBe('float')
                        expect(inferPrimitiveType([1, 2])).toBe('vec2')
                        expect(inferPrimitiveType([1, 2, 3])).toBe('vec3')
                        expect(inferPrimitiveType([1, 2, 3, 4])).toBe('vec4')
                })

                it('should infer matrix types from array length', () => {
                        expect(inferPrimitiveType(new Array(9).fill(0))).toBe('mat3')
                        expect(inferPrimitiveType(new Array(16).fill(0))).toBe('mat4')
                })

                it('should infer void from invalid values', () => {
                        expect(inferPrimitiveType(undefined)).toBe('void')
                        // @ts-ignore @TODO FIX #127 `Argument of type 'null' is not assignable to parameter of type 'Y<Constants>'.`
                        expect(inferPrimitiveType(null)).toBe('void')
                })
        })

        describe('Node Type Inference', () => {
                it('should infer scalar types correctly', () => {
                        expect(infer(float(1.0))).toBe('float')
                        expect(infer(int(42))).toBe('int')
                        expect(infer(uint(3))).toBe('uint')
                        expect(infer(bool(true))).toBe('bool')
                })

                it('should infer vector types correctly', () => {
                        expect(infer(vec2(1, 2))).toBe('vec2')
                        expect(infer(vec3(1, 2, 3))).toBe('vec3')
                        expect(infer(vec4(1, 2, 3, 4))).toBe('vec4')
                })

                it('should infer integer vector types correctly', () => {
                        expect(infer(ivec2(1, 2))).toBe('ivec2')
                        expect(infer(ivec3(1, 2, 3))).toBe('ivec3')
                        expect(infer(ivec4(1, 2, 3, 4))).toBe('ivec4')
                })

                it('should infer unsigned vector types correctly', () => {
                        expect(infer(uvec2(1, 2))).toBe('uvec2')
                        expect(infer(uvec3(1, 2, 3))).toBe('uvec3')
                        expect(infer(uvec4(1, 2, 3, 4))).toBe('uvec4')
                })

                it('should infer boolean vector types correctly', () => {
                        expect(infer(bvec2(true, false))).toBe('bvec2')
                        expect(infer(bvec3(true, false, true))).toBe('bvec3')
                        expect(infer(bvec4(true, false, true, false))).toBe('bvec4')
                })

                it('should infer matrix types correctly', () => {
                        expect(infer(mat2())).toBe('mat2')
                        expect(infer(mat3())).toBe('mat3')
                        expect(infer(mat4())).toBe('mat4')
                })
        })

        describe('Operator Type Inference', () => {
                it('should infer arithmetic operation ress correctly', () => {
                        const x = vec3(1, 2, 3)
                        const y = vec3(4, 5, 6)
                        const res = x.add(y)
                        expect(infer(res)).toBe('vec3')
                })

                it('should infer scalar-vector broadcast operations correctly', () => {
                        const x = float(2.0)
                        const y = vec3(1, 2, 3)
                        const res = y.mul(x)
                        expect(infer(res)).toBe('vec3')
                })

                it('should infer matrix-vector multiplication correctly', () => {
                        const m = mat3()
                        const v = vec3(1, 2, 3)
                        const res = m.mul(v)
                        expect(infer(res)).toBe('vec3')
                })

                it('should infer comparison operations as bool', () => {
                        const x = float(1.0)
                        const y = float(2.0)
                        const res = x.lessThan(y)
                        expect(infer(res)).toBe('bool')
                })

                it('should infer logical operations as bool', () => {
                        const x = bool(true)
                        const y = bool(false)
                        const res = x.and(y)
                        expect(infer(res)).toBe('bool')
                })
        })

        describe('Swizzle Type Inference', () => {
                it('should infer single component swizzles as scalar', () => {
                        const x = vec3(1, 2, 3)
                        expect(infer(x.x)).toBe('float')
                        expect(infer(x.y)).toBe('float')
                        expect(infer(x.z)).toBe('float')
                })

                it('should infer two component swizzles as vec2', () => {
                        const x = vec4(1, 2, 3, 4)
                        expect(infer(x.xy)).toBe('vec2')
                        expect(infer(x.zw)).toBe('vec2')
                        expect(infer(x.rg)).toBe('vec2')
                })

                it('should infer three component swizzles as vec3', () => {
                        const x = vec4(1, 2, 3, 4)
                        expect(infer(x.xyz)).toBe('vec3')
                        expect(infer(x.rgb)).toBe('vec3')
                })

                it('should infer four component swizzles as vec4', () => {
                        const x = vec4(1, 2, 3, 4)
                        expect(infer(x.xyzw)).toBe('vec4')
                        expect(infer(x.rgba)).toBe('vec4')
                })

                it('should infer integer vector swizzles correctly', () => {
                        const x = ivec3(1, 2, 3)
                        expect(infer(x.x)).toBe('int')
                        expect(infer(x.xy)).toBe('ivec2')
                        expect(infer(x.xyz)).toBe('ivec3')
                })

                it('should infer unsigned vector swizzles correctly', () => {
                        const x = uvec2(1, 2)
                        expect(infer(x.x)).toBe('uint')
                        expect(infer(x.xy)).toBe('uvec2')
                })

                it('should infer boolean vector swizzles correctly', () => {
                        const x = bvec4(true, false, true, false)
                        expect(infer(x.x)).toBe('bool')
                        expect(infer(x.xy)).toBe('bvec2')
                        expect(infer(x.xyz)).toBe('bvec3')
                        expect(infer(x.xyzw)).toBe('bvec4')
                })
        })

        describe('Function Return Type Inference', () => {
                it('should infer component-wise function returns correctly', () => {
                        const x = vec3(1, 2, 3)
                        expect(infer(x.abs())).toBe('vec3')
                        expect(infer(x.sin())).toBe('vec3')
                        expect(infer(x.normalize())).toBe('vec3')
                })

                it('should infer reduction function returns correctly', () => {
                        const x = vec3(1, 2, 3)
                        expect(infer(x.length())).toBe('float')
                        expect(infer(x.dot(vec3(4, 5, 6)))).toBe('float')
                        // const y = ivec3(1, 2, 3)
                        // expect(infer(y.dot(ivec3(4, 5, 6)))).toBe('int') // .dot does not allow operations between ivec3
                })

                it('should infer cross product as vec3', () => {
                        const x = vec3(1, 2, 3)
                        const y = vec3(4, 5, 6)
                        expect(infer(x.cross(y))).toBe('vec3')
                })

                it('should infer texture sampling as vec4', () => {
                        const x = float().texture()
                        const y = vec2(0.5, 0.5)
                        expect(infer(x.texture(y))).toBe('vec4')
                })
        })

        describe('Conversion Type Inference', () => {
                it('should infer explicit conversions correctly', () => {
                        const x = float(1.0)
                        expect(infer(x.toInt())).toBe('int')
                        expect(infer(x.toBool())).toBe('bool')
                        expect(infer(x.toVec3())).toBe('vec3')
                })

                it('should infer vector conversions correctly', () => {
                        const x = vec2(1, 2)
                        expect(infer(x.toVec3())).toBe('vec3')
                        expect(infer(x.toVec4())).toBe('vec4')
                })

                it('should infer matrix conversions correctly', () => {
                        const x = float(1.0)
                        expect(infer(x.toMat2())).toBe('mat2')
                        expect(infer(x.toMat3())).toBe('mat3')
                        expect(infer(x.toMat4())).toBe('mat4')
                })
        })

        describe('Complex Expression Type Inference', () => {
                it('should infer nested operations correctly', () => {
                        const x = vec3(1, 2, 3)
                        const y = vec3(4, 5, 6)
                        const res = x.add(y).mul(float(2.0)).normalize()
                        expect(infer(res)).toBe('vec3')
                })

                it('should infer mixed type operations correctly', () => {
                        const scalar = float(2.0)
                        const vector = vec3(1, 2, 3)
                        const matrix = mat3()
                        const res = matrix.mul(vector).mul(scalar)
                        expect(infer(res)).toBe('vec3')
                })

                it('should infer conditional expressions correctly', () => {
                        const condition = bool(true)
                        const trueValue = vec3(1, 2, 3)
                        const falseValue = vec3(4, 5, 6)
                        const res = trueValue.select(falseValue, condition)
                        expect(infer(res)).toBe('vec3')
                })
        })
})
