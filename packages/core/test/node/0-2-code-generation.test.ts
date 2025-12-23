import { describe, it, expect } from '@jest/globals'
import { float, vec3, mat3, bool, int, uniform, builtin } from '../../src/node'
import { code } from '../../src/node/utils'
import type { NodeContext } from '../../src/node/types'

describe('Code Generation Engine', () => {
        const createWGSLContext = (): NodeContext => ({ isWebGL: false })
        const createGLSLContext = (): NodeContext => ({ isWebGL: true })

        describe('Primitive Value Code Generation', () => {
                it('should generate correct WGSL/GLSL for number literals', () => {
                        expect(code(42, createWGSLContext())).toBe('42.0')
                        expect(code(3.14, createWGSLContext())).toBe('3.14')
                        expect(code(42, createGLSLContext())).toBe('42.0')
                        expect(code(3.14, createGLSLContext())).toBe('3.14')
                })

                it('should generate correct code for boolean literals', () => {
                        expect(code(true, createWGSLContext())).toBe('true')
                        expect(code(false, createWGSLContext())).toBe('false')
                        expect(code(true, createGLSLContext())).toBe('true')
                        expect(code(false, createGLSLContext())).toBe('false')
                })

                it('should generate correct code for string literals', () => {
                        expect(code('texture.png', createWGSLContext())).toBe('texture.png')
                        expect(code('', createWGSLContext())).toBe('')
                })

                it('should generate correct code for array literals', () => {
                        expect(code([1, 2], createWGSLContext())).toBe('1.0, 2.0')
                        expect(code([1, 2, 3], createWGSLContext())).toBe('1.0, 2.0, 3.0')
                })
        })

        describe('Vector Constructor Code Generation', () => {
                it('should generate correct WGSL vector constructors', () => {
                        const c = createWGSLContext()
                        expect(code(vec3(1, 2, 3), c)).toBe('vec3f(1.0, 2.0, 3.0)')
                })

                it('should generate correct GLSL vector constructors', () => {
                        const c = createGLSLContext()
                        expect(code(vec3(1, 2, 3), c)).toBe('vec3(1.0, 2.0, 3.0)')
                })

                it('should handle mixed parameter types in constructors', () => {
                        const x = float(1.0)
                        const c = createWGSLContext()
                        expect(code(vec3(x, 2, 3), c)).toBe('vec3f(1.0, 2.0, 3.0)')
                })
        })

        describe('Operator Code Generation', () => {
                it('should generate correct arithmetic operators', () => {
                        const x = float(1.0)
                        const y = float(2.0)
                        const c = createWGSLContext()
                        expect(code(x.add(y), c)).toBe('(1.0 + 2.0)')
                        expect(code(x.sub(y), c)).toBe('(1.0 - 2.0)')
                        expect(code(x.mul(y), c)).toBe('(1.0 * 2.0)')
                        expect(code(x.div(y), c)).toBe('(1.0 / 2.0)')
                })

                it('should generate correct comparison operators', () => {
                        const x = float(1.0)
                        const y = float(2.0)
                        const c = createWGSLContext()
                        expect(code(x.lessThan(y), c)).toBe('(1.0 < 2.0)')
                        expect(code(x.greaterThan(y), c)).toBe('(1.0 > 2.0)')
                        expect(code(x.equal(y), c)).toBe('(1.0 == 2.0)')
                        expect(code(x.notEqual(y), c)).toBe('(1.0 != 2.0)')
                })

                it('should generate correct logical operators', () => {
                        const x = bool(true)
                        const y = bool(false)
                        const c = createWGSLContext()
                        expect(code(x.and(y), c)).toBe('(true && false)')
                        expect(code(x.or(y), c)).toBe('(true || false)')
                        expect(code(x.not(), c)).toBe('!true')
                })

                it('should handle operator precedence correctly', () => {
                        const x = float(2.0)
                        const y = float(3.0)
                        const w = float(4.0)
                        const c = createWGSLContext()
                        expect(code(x.add(y.mul(w)), c)).toBe('(2.0 + (3.0 * 4.0))')
                })
        })

        describe('Function Call Code Generation', () => {
                it('should generate correct component-wise function calls', () => {
                        const x = vec3(1, 2, 3)
                        const c = createWGSLContext()
                        expect(code(x.sin(), c)).toBe('sin(vec3f(1.0, 2.0, 3.0))')
                        expect(code(x.cos(), c)).toBe('cos(vec3f(1.0, 2.0, 3.0))')
                        expect(code(x.abs(), c)).toBe('abs(vec3f(1.0, 2.0, 3.0))')
                })

                it('should generate correct reduction function calls', () => {
                        const x = vec3(1, 2, 3)
                        const c = createWGSLContext()
                        expect(code(x.length(), c)).toBe('length(vec3f(1.0, 2.0, 3.0))')
                        expect(code(x.normalize(), c)).toBe('normalize(vec3f(1.0, 2.0, 3.0))')
                })

                it('should generate correct multi-parameter function calls', () => {
                        const x = vec3(1, 2, 3)
                        const y = vec3(4, 5, 6)
                        const z = float(0.5)
                        const c = createWGSLContext()
                        expect(code(x.mix(y, z), c)).toBe('mix(vec3f(1.0, 2.0, 3.0), vec3f(4.0, 5.0, 6.0), 0.5)')
                })

                it('should handle special function transformations', () => {
                        const x = float(2.0)
                        const c = createWGSLContext()
                        expect(code(x.negate(), c)).toBe('(-2.0)')
                        expect(code(x.oneMinus(), c)).toBe('(1.0-2.0)')
                        expect(code(x.reciprocal(), c)).toBe('(1.0 / 2.0)')
                        expect(code(x.saturate(), c)).toBe('clamp(2.0, 0.0, 1.0)')
                })

                it('should handle platform-specific function differences', () => {
                        const x = float(1.0)
                        const y = float(2.0)
                        const wgslContext = createWGSLContext()
                        expect(code(x.dFdx(), wgslContext)).toBe('dpdx(1.0)')
                        expect(code(x.dFdy(), wgslContext)).toBe('dpdy(1.0)')
                        const glslContext = createGLSLContext()
                        expect(code(x.dFdx(), glslContext)).toBe('dFdx(1.0)')
                        expect(code(x.dFdy(), glslContext)).toBe('dFdy(1.0)')
                        expect(code(x.atan2(y), glslContext)).toBe('atan(1.0, 2.0)')
                })
        })

        describe('Swizzle Code Generation', () => {
                it('should generate correct single component swizzles', () => {
                        const x = vec3(1, 2, 3)
                        const c = createWGSLContext()
                        expect(code(x.x, c)).toBe('vec3f(1.0, 2.0, 3.0).x')
                        expect(code(x.y, c)).toBe('vec3f(1.0, 2.0, 3.0).y')
                        expect(code(x.z, c)).toBe('vec3f(1.0, 2.0, 3.0).z')
                })

                it('should generate correct multi-component swizzles', () => {
                        const x = vec3(1, 2, 3)
                        const c = createWGSLContext()
                        expect(code(x.xy, c)).toBe('vec3f(1.0, 2.0, 3.0).xy')
                        expect(code(x.xyz, c)).toBe('vec3f(1.0, 2.0, 3.0).xyz')
                })

                it('should handle different swizzle patterns', () => {
                        const x = vec3(1, 2, 3)
                        const c = createWGSLContext()
                        expect(code(x.rgb, c)).toBe('vec3f(1.0, 2.0, 3.0).rgb')
                        expect(code(x.st, c)).toBe('vec3f(1.0, 2.0, 3.0).st')
                })
        })

        describe('Conversion Code Generation', () => {
                it('should generate correct type conversions for WGSL', () => {
                        const x = float(1.0)
                        const c = createWGSLContext()
                        expect(code(x.toInt(), c)).toBe('i32(1.0)')
                        expect(code(x.toVec3(), c)).toBe('vec3f(1.0)')
                        expect(code(x.toBool(), c)).toBe('bool(1.0)')
                })

                it('should generate correct type conversions for GLSL', () => {
                        const x = float(1.0)
                        const c = createGLSLContext()
                        expect(code(x.toInt(), c)).toBe('int(1.0)')
                        expect(code(x.toVec3(), c)).toBe('vec3(1.0)')
                        expect(code(x.toBool(), c)).toBe('bool(1.0)')
                })
        })

        describe('Variable Reference Code Generation', () => {
                it('should generate correct variable references', () => {
                        const x = uniform(float(), 'testUniform')
                        const c = createWGSLContext()
                        expect(code(x, c)).toBe('testUniform')
                })

                it('should generate correct builtin variable references for WGSL', () => {
                        const pos = builtin('position')
                        const c = createWGSLContext()
                        c.label = 'frag'
                        expect(code(pos, c)).toBe('in.position')
                })
        })

        describe('Conditional Expression Code Generation', () => {
                it('should generate correct ternary expressions for WGSL', () => {
                        const condition = bool(true)
                        const trueVal = float(1.0)
                        const falseVal = float(0.0)
                        const c = createWGSLContext()
                        expect(code(trueVal.select(falseVal, condition), c)).toBe('select(1.0, 0.0, true)')
                })

                it('should generate correct ternary expressions for GLSL', () => {
                        const condition = bool(true)
                        const trueVal = float(1.0)
                        const falseVal = float(0.0)
                        const c = createGLSLContext()
                        expect(code(trueVal.select(falseVal, condition), c)).toBe('(true ? 1.0 : 0.0)')
                })
        })

        describe('Complex Expression Code Generation', () => {
                it('should generate correct code for nested operations', () => {
                        const x = vec3(1, 2, 3)
                        const y = vec3(4, 5, 6)
                        const c = createWGSLContext()
                        const res = x.add(y).normalize().x
                        const generated = code(res, c)
                        expect(generated).toBe('normalize((vec3f(1.0, 2.0, 3.0) + vec3f(4.0, 5.0, 6.0))).x')
                })

                it('should handle matrix-vector operations correctly', () => {
                        const m = mat3()
                        const v = vec3(1, 2, 3)
                        const c = createWGSLContext()
                        expect(code(m.mul(v), c)).toBe('(mat3x3f() * vec3f(1.0, 2.0, 3.0))')
                })

                it('should preserve operation order in complex expressions', () => {
                        const x = float(1.0)
                        const y = float(2.0)
                        const w = float(3.0)
                        const c = createWGSLContext()
                        expect(code(x.add(y).mul(w), c)).toBe('((1.0 + 2.0) * 3.0)')
                })
        })

        describe('Assignment Operation Code Generation', () => {
                it('should generate correct assignment operations', () => {
                        const x = float(1.0)
                        const y = float(2.0)
                        const c = createWGSLContext()
                        expect(code(x.addAssign(y), c)).toBe('1.0 += 2.0;')
                        expect(code(x.mulAssign(y), c)).toBe('1.0 *= 2.0;')
                })
        })

        describe('Element Access Code Generation', () => {
                it('should generate correct array element access', () => {
                        const arr = vec3(1, 2, 3)
                        const index = int(0)
                        const c = createWGSLContext()
                        expect(code(arr.element(index), c)).toBe('vec3f(1.0, 2.0, 3.0)[0]')
                })
        })
})
