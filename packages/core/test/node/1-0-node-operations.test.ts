import { describe, it, expect } from '@jest/globals'
import { float, int, uint, bool, vec2, vec3, vec4, mat3, uniform, attribute, storage, constant, variable, builtin, color, texture2D } from '../../src/node'
import { infer } from '../../src/node/utils/infer'

describe('Node Creation & Operations', () => {
        describe('Factory Function Node Creation', () => {
                it('should create scalar nodes with correct types', () => {
                        const x = float(1.5)
                        const y = int(42)
                        const z = uint(10)
                        const w = bool(true)
                        expect(x.type).toBe('conversion')
                        expect(y.type).toBe('conversion')
                        expect(z.type).toBe('conversion')
                        expect(w.type).toBe('conversion')
                        expect(infer(x)).toBe('float')
                        expect(infer(y)).toBe('int')
                        expect(infer(z)).toBe('uint')
                        expect(infer(w)).toBe('bool')
                })

                it('should create vector nodes with correct types', () => {
                        const x = vec2(1, 2)
                        const y = vec3(1, 2, 3)
                        const z = vec4(1, 2, 3, 4)
                        expect(x.type).toBe('conversion')
                        expect(y.type).toBe('conversion')
                        expect(z.type).toBe('conversion')
                        expect(infer(x)).toBe('vec2')
                        expect(infer(y)).toBe('vec3')
                        expect(infer(z)).toBe('vec4')
                })

                it('should create matrix nodes with correct types', () => {
                        const x = mat3()
                        expect(x.type).toBe('conversion')
                        expect(infer(x)).toBe('mat3')
                })

                it('should create special utility nodes correctly', () => {
                        const col = color(0xff0000)
                        const tex = texture2D()
                        expect(infer(col)).toBe('vec3')
                        expect(infer(tex)).toBe('texture')
                })
        })

        describe('Variable Declaration Node Creation', () => {
                it('should create uniform nodes with correct structure', () => {
                        const x = uniform(float(1.0), 'testUniform')
                        expect(x.type).toBe('uniform')
                        expect(x.props.id).toBe('testUniform')
                        expect(x.props.children).toHaveLength(1)
                        expect(infer(x)).toBe('float')
                })

                it('should create attribute nodes with correct structure', () => {
                        const pos = attribute(vec3([1, 2, 3, 4, 5, 6]), 'position')
                        expect(pos.type).toBe('attribute')
                        expect(pos.props.id).toBe('position')
                        expect(infer(pos)).toBe('vec3')
                })

                it('should create storage nodes with correct structure', () => {
                        const data = storage(float(), 'storageData')
                        expect(data.type).toBe('storage')
                        expect(data.props.id).toBe('storageData')
                        expect(infer(data)).toBe('float')
                })

                it('should create constant nodes with correct structure', () => {
                        const pi = constant(float(3.14159), 'PI')
                        expect(pi.type).toBe('constant')
                        expect(pi.props.id).toBe('PI')
                        expect(infer(pi)).toBe('float')
                })

                it('should create variable nodes with correct structure', () => {
                        const temp = variable('tempVar')
                        expect(temp.type).toBe('variable')
                        expect(temp.props.id).toBe('tempVar')
                })

                it('should create builtin nodes with correct structure', () => {
                        const pos = builtin('position')
                        expect(pos.type).toBe('builtin')
                        expect(pos.props.id).toBe('position')
                        expect(infer(pos)).toBe('vec4')
                })
        })

        describe('Arithmetic Operations', () => {
                it('should perform scalar arithmetic operations correctly', () => {
                        const x = float(5.0)
                        const y = float(3.0)
                        const add = x.add(y)
                        const sub = x.sub(y)
                        const mul = x.mul(y)
                        const div = x.div(y)
                        expect(add.type).toBe('operator')
                        expect(sub.type).toBe('operator')
                        expect(mul.type).toBe('operator')
                        expect(div.type).toBe('operator')
                        expect(infer(add)).toBe('float')
                        expect(infer(sub)).toBe('float')
                        expect(infer(mul)).toBe('float')
                        expect(infer(div)).toBe('float')
                })

                it('should perform vector arithmetic operations correctly', () => {
                        const x = vec3(1, 2, 3)
                        const y = vec3(4, 5, 6)
                        const add = x.add(y)
                        const sub = x.sub(y)
                        const mul = x.mul(y)
                        const div = x.div(y)
                        expect(infer(add)).toBe('vec3')
                        expect(infer(sub)).toBe('vec3')
                        expect(infer(mul)).toBe('vec3')
                        expect(infer(div)).toBe('vec3')
                })

                it('should perform scalar-vector broadcast operations correctly', () => {
                        const scalar = float(2.0)
                        const vector = vec3(1, 2, 3)
                        const res1 = vector.mul(scalar)
                        const res2 = vector.add(scalar)
                        expect(infer(res1)).toBe('vec3')
                        expect(infer(res2)).toBe('vec3')
                })

                it('should perform matrix-vector operations correctly', () => {
                        const matrix = mat3()
                        const vector = vec3(1, 2, 3)
                        const res = matrix.mul(vector)
                        expect(infer(res)).toBe('vec3')
                })
        })

        describe('Comparison Operations', () => {
                it('should perform comparison operations returning bool', () => {
                        const x = float(5.0)
                        const y = float(3.0)
                        const lt = x.lessThan(y)
                        const le = x.lessThanEqual(y)
                        const gt = x.greaterThan(y)
                        const ge = x.greaterThanEqual(y)
                        const eq = x.equal(y)
                        const ne = x.notEqual(y)
                        expect(infer(lt)).toBe('bool')
                        expect(infer(le)).toBe('bool')
                        expect(infer(gt)).toBe('bool')
                        expect(infer(ge)).toBe('bool')
                        expect(infer(eq)).toBe('bool')
                        expect(infer(ne)).toBe('bool')
                })

                it('should handle vector comparison operations', () => {
                        const x = vec3(1, 2, 3)
                        const y = vec3(4, 5, 6)
                        const res = x.equal(y)
                        expect(infer(res)).toBe('bool')
                })
        })

        describe('Logical Operations', () => {
                it('should perform logical operations on bool values', () => {
                        const x = bool(true)
                        const y = bool(false)
                        const andResult = x.and(y)
                        const orResult = x.or(y)
                        const notResult = x.not()
                        expect(infer(andResult)).toBe('bool')
                        expect(infer(orResult)).toBe('bool')
                        // expect(infer(notResult)).toBe('bool') // ??
                })
        })

        describe('Component-wise Function Operations', () => {
                it('should perform component-wise math functions correctly', () => {
                        const x = vec3(1, 2, 3)
                        const sinResult = x.sin()
                        const cosResult = x.cos()
                        const absResult = x.abs()
                        const sqrtResult = x.sqrt()
                        expect(infer(sinResult)).toBe('vec3')
                        expect(infer(cosResult)).toBe('vec3')
                        expect(infer(absResult)).toBe('vec3')
                        expect(infer(sqrtResult)).toBe('vec3')
                })

                it('should handle scalar component-wise functions', () => {
                        const x = float(1.5)
                        const sinResult = x.sin()
                        const floorResult = x.floor()
                        const ceilResult = x.ceil()
                        expect(infer(sinResult)).toBe('float')
                        expect(infer(floorResult)).toBe('float')
                        expect(infer(ceilResult)).toBe('float')
                })
        })

        describe('Reduction Function Operations', () => {
                it('should perform vector reduction functions correctly', () => {
                        const x = vec3(1, 2, 3)
                        const length = x.length()
                        const normalize = x.normalize()
                        expect(infer(length)).toBe('float')
                        expect(infer(normalize)).toBe('vec3')
                })

                it('should perform dot product correctly', () => {
                        const x = vec3(1, 2, 3)
                        const y = vec3(4, 5, 6)
                        const dotResult = x.dot(y)
                        expect(infer(dotResult)).toBe('float')
                })

                it('should perform cross product correctly', () => {
                        const x = vec3(1, 2, 3)
                        const y = vec3(4, 5, 6)
                        const crossResult = x.cross(y)
                        expect(infer(crossResult)).toBe('vec3')
                })
        })

        describe('Multi-parameter Function Operations', () => {
                it('should perform mix function correctly', () => {
                        const x = vec3(1, 2, 3)
                        const y = vec3(4, 5, 6)
                        const t = float(0.5)
                        const mixResult = x.mix(y, t)
                        expect(infer(mixResult)).toBe('vec3')
                })

                it('should perform clamp function correctly', () => {
                        const x = vec3(1, 2, 3)
                        const min = vec3(0, 0, 0)
                        const max = vec3(1, 1, 1)
                        const clampResult = x.clamp(min, max)
                        expect(infer(clampResult)).toBe('vec3')
                })

                it('should perform step function correctly', () => {
                        const edge = float(0.5)
                        const x = vec3(0.3, 0.7, 1.2)
                        const stepResult = x.step(edge)
                        expect(infer(stepResult)).toBe('vec3')
                })
        })

        describe('Swizzle Operations', () => {
                it('should perform single component swizzles correctly', () => {
                        const x = vec3(1, 2, 3)
                        expect(infer(x.x)).toBe('float')
                        expect(infer(x.y)).toBe('float')
                        expect(infer(x.z)).toBe('float')
                })

                it('should perform multi-component swizzles correctly', () => {
                        const x = vec4(1, 2, 3, 4)
                        expect(infer(x.xy)).toBe('vec2')
                        expect(infer(x.xyz)).toBe('vec3')
                        expect(infer(x.xyzw)).toBe('vec4')
                })

                it('should handle different swizzle patterns', () => {
                        const x = vec3(1, 2, 3)
                        expect(infer(x.rgb)).toBe('vec3')
                        expect(infer(x.rg)).toBe('vec2')
                        expect(infer(x.r)).toBe('float')
                })
        })

        describe('Type Conversion Operations', () => {
                it('should perform explicit type conversions correctly', () => {
                        const x = float(1.5)
                        expect(infer(x.toInt())).toBe('int')
                        expect(infer(x.toBool())).toBe('bool')
                        expect(infer(x.toVec2())).toBe('vec2')
                        expect(infer(x.toVec3())).toBe('vec3')
                        expect(infer(x.toVec4())).toBe('vec4')
                })

                it('should handle vector to different size vector conversions', () => {
                        const x = vec2(1, 2)
                        expect(infer(x.toVec3())).toBe('vec3')
                        expect(infer(x.toVec4())).toBe('vec4')
                        expect(infer(x.toFloat())).toBe('float')
                })
        })

        /**
         * @TODO FIX array node (#128)
        describe('Element Access Operations', () => {
                it('should handle array element access correctly', () => {
                        const arr = vec3(1, 2, 3)
                        const index = int(1)
                        const element = arr.element(index)
                        expect(element.type).toBe('element')
                        expect(infer(element)).toBe('float')
                })
        })
         */

        describe('Conditional Selection Operations', () => {
                it('should handle conditional selection correctly', () => {
                        const condition = bool(true)
                        const trueValue = vec3(1, 0, 0)
                        const falseValue = vec3(0, 1, 0)
                        const res = trueValue.select(falseValue, condition)
                        expect(res.type).toBe('ternary')
                        expect(infer(res)).toBe('vec3')
                })

                it('should handle scalar conditional selection', () => {
                        const condition = bool(false)
                        const trueValue = float(1.0)
                        const falseValue = float(0.0)
                        const res = trueValue.select(falseValue, condition)
                        expect(infer(res)).toBe('float')
                })
        })

        describe('Chained Operations', () => {
                it('should handle complex operation chains correctly', () => {
                        const x = vec3(1, 2, 3)
                        const y = vec3(4, 5, 6)
                        const res = x.add(y).normalize().mul(float(2.0))
                        expect(infer(res)).toBe('vec3')
                })

                it('should maintain type correctness through chains', () => {
                        const x = vec3(1, 2, 3)
                        const res = x.sin().cos().abs().length()
                        expect(infer(res)).toBe('float')
                })

                it('should handle mixed swizzle and arithmetic chains', () => {
                        const x = vec4(1, 2, 3, 4)
                        const res = x.xyz.add(vec3(1, 1, 1)).xy
                        expect(infer(res)).toBe('vec2')
                })
        })

        describe('Assignment Operations', () => {
                it('should handle assignment operators correctly', () => {
                        const x = float(1.0)
                        const y = float(2.0)
                        const addAssign = x.addAssign(y)
                        const mulAssign = x.mulAssign(y)
                        expect(addAssign.type).toBe('operator')
                        expect(mulAssign.type).toBe('operator')
                })
        })
})
