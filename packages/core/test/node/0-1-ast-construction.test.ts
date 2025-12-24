import { describe, expect, it } from '@jest/globals'
import { attribute, builtin, float, uniform, vec3 } from '../../src/node'

describe('Abstract Syntax Tree Construction', () => {
        describe('Node Structure Validation', () => {
                it('should create nodes with correct type and props structure', () => {
                        const x = float(1.0)
                        expect(x.type).toBe('conversion')
                        expect(x.props.children).toEqual(['float', 1.0])
                        expect(x.isProxy).toBe(true)
                })

                it('should maintain parent-child relationships in operations', () => {
                        const x = vec3(1, 2, 3)
                        const y = vec3(4, 5, 6)
                        const z = x.add(y)
                        expect(z.type).toBe('operator')
                        expect(z.props.children).toEqual(['add', x, y])
                })

                it('should construct proper node hierarchy for complex expressions', () => {
                        const x = float(1.0)
                        const y = float(2.0)
                        const z = x.add(y).mul(float(3.0))
                        expect(z.type).toBe('operator')
                        expect(z.props.children?.[0]).toBe('mul')
                        const addNode = z.props.children?.[1]
                        expect(addNode?.type).toBe('operator')
                        expect(addNode?.props.children?.[0]).toBe('add')
                })
        })

        describe('Operator AST Construction', () => {
                it('should construct arithmetic operator nodes correctly', () => {
                        const x = float(5.0)
                        const y = float(3.0)
                        const add = x.add(y)
                        expect(add.type).toBe('operator')
                        expect(add.props.children?.[0]).toBe('add')
                        const sub = x.sub(y)
                        expect(sub.type).toBe('operator')
                        expect(sub.props.children?.[0]).toBe('sub')
                        const mul = x.mul(y)
                        expect(mul.type).toBe('operator')
                        expect(mul.props.children?.[0]).toBe('mul')
                        const div = x.div(y)
                        expect(div.type).toBe('operator')
                        expect(div.props.children?.[0]).toBe('div')
                })

                it('should construct comparison operator nodes correctly', () => {
                        const x = float(5.0)
                        const y = float(3.0)
                        const lt = x.lessThan(y)
                        expect(lt.type).toBe('operator')
                        expect(lt.props.children?.[0]).toBe('lessThan')
                        const eq = x.equal(y)
                        expect(eq.type).toBe('operator')
                        expect(eq.props.children?.[0]).toBe('equal')
                })

                it('should maintain operator precedence in AST structure', () => {
                        const x = float(2.0)
                        const y = float(3.0)
                        const w = float(4.0)
                        const z = x.add(y.mul(w))
                        expect(z.type).toBe('operator')
                        expect(z.props.children?.[0]).toBe('add')
                        const mulNode = z.props.children?.[2]
                        expect(mulNode?.type).toBe('operator')
                        expect(mulNode?.props.children?.[0]).toBe('mul')
                })
        })

        describe('Function Call AST Construction', () => {
                it('should construct component-wise function nodes correctly', () => {
                        const x = vec3(1, 2, 3)
                        const res = x.sin()
                        expect(res.type).toBe('function')
                        expect(res.props.children?.[0]).toBe('sin')
                        expect(res.props.children?.[1]).toBe(x)
                })

                it('should construct reduction function nodes correctly', () => {
                        const x = vec3(1, 2, 3)
                        const len = x.length()
                        expect(len.type).toBe('function')
                        expect(len.props.children?.[0]).toBe('length')
                        expect(len.props.children?.[1]).toBe(x)
                })

                it('should construct multi-argument function nodes correctly', () => {
                        const x = vec3(1, 2, 3)
                        const y = vec3(4, 5, 6)
                        const z = float(0.5)
                        const res = x.mix(y, z)
                        expect(res.type).toBe('function')
                        expect(res.props.children).toEqual(['mix', x, y, z])
                })

                it('should handle nested function calls correctly', () => {
                        const x = vec3(1, 2, 3)
                        const res = x.normalize().sin().abs()
                        expect(res.type).toBe('function')
                        expect(res.props.children?.[0]).toBe('abs')
                        const sinNode = res.props.children?.[1]
                        expect(sinNode?.type).toBe('function')
                        expect(sinNode?.props.children?.[0]).toBe('sin')
                        const normalizeNode = sinNode?.props.children?.[1]
                        expect(normalizeNode?.type).toBe('function')
                        expect(normalizeNode?.props.children?.[0]).toBe('normalize')
                })
        })

        describe('Swizzle AST Construction', () => {
                it('should construct single component swizzle as member access', () => {
                        const x = vec3(1, 2, 3)
                        const y = x.x
                        expect(y.type).toBe('member')
                        expect(y.props.children).toEqual([x, 'x'])
                })

                it('should construct multi-component swizzle as member access', () => {
                        const x = vec3(1, 2, 3)
                        const y = x.xy
                        expect(y.type).toBe('member')
                        expect(y.props.children).toEqual([x, 'xy'])
                })

                it('should handle complex swizzle patterns', () => {
                        const x = vec3(1, 2, 3)
                        const y = x.xyz
                        const z = x.rgb
                        expect(y.type).toBe('member')
                        expect(y.props.children).toEqual([x, 'xyz'])
                        expect(z.type).toBe('member')
                        expect(z.props.children).toEqual([x, 'rgb'])
                })
        })

        describe('Conversion AST Construction', () => {
                it('should construct type conversion nodes correctly', () => {
                        const x = float(1.0)
                        const y = x.toVec3()
                        expect(y.type).toBe('conversion')
                        expect(y.props.children?.[0]).toBe('vec3')
                        expect(y.props.children?.[1]).toBe(x)
                })

                it('should handle chain conversions correctly', () => {
                        const x = float(1.0)
                        const y = x.toVec3().toVec4()
                        expect(y.type).toBe('conversion')
                        expect(y.props.children?.[0]).toBe('vec4')
                        const vec3Node = y.props.children?.[1]
                        expect(vec3Node?.type).toBe('conversion')
                        expect(vec3Node?.props.children?.[0]).toBe('vec3')
                })
        })

        describe('Variable Declaration AST Construction', () => {
                it('should construct uniform nodes correctly', () => {
                        const x = uniform(float(), 'testUniform')
                        expect(x.type).toBe('uniform')
                        expect(x.props.id).toBe('testUniform')
                        expect(x.props.children?.[0]?.type).toBe('conversion')
                })

                it('should construct attribute nodes correctly', () => {
                        const x = attribute(vec3(), 'position')
                        expect(x.type).toBe('attribute')
                        expect(x.props.id).toBe('position')
                        expect(x.props.children?.[0]?.type).toBe('conversion')
                })

                it('should construct builtin nodes correctly', () => {
                        const x = builtin('vertex_index')
                        expect(x.type).toBe('builtin')
                        expect(x.props.id).toBe('vertex_index')
                })
        })

        describe('Complex Expression AST Structure', () => {
                it('should maintain correct tree depth for complex operations', () => {
                        const x = vec3(1, 2, 3)
                        const y = vec3(4, 5, 6)
                        const z = vec3(7, 8, 9)
                        const res = x.add(y).cross(z).normalize()
                        expect(res.type).toBe('function')
                        expect(res.props.children?.[0]).toBe('normalize')
                        const crossNode = res.props.children?.[1]
                        expect(crossNode?.type).toBe('function')
                        expect(crossNode?.props.children?.[0]).toBe('cross')
                        const addNode = crossNode?.props.children?.[1]
                        expect(addNode?.type).toBe('operator')
                        expect(addNode?.props.children?.[0]).toBe('add')
                })

                it('should handle mixed operation types correctly', () => {
                        const x = vec3(1, 2, 3)
                        const y = float(2.0)
                        const res = x.mul(y).x.add(float(1.0))
                        expect(res.type).toBe('operator')
                        expect(res.props.children?.[0]).toBe('add')
                        const memberNode = res.props.children?.[1]
                        expect(memberNode?.type).toBe('member')
                        expect(memberNode?.props.children?.[1]).toBe('x')
                        const mulNode = memberNode?.props.children?.[0]
                        expect(mulNode?.type).toBe('operator')
                        expect(mulNode?.props.children?.[0]).toBe('mul')
                })

                it('should preserve node identity in complex expressions', () => {
                        const x = vec3(1, 2, 3)
                        const y = x.normalize()
                        const z = y.length()
                        expect(y.props.children?.[1]).toBe(x)
                        expect(z.props.children?.[1]).toBe(y)
                })
        })

        describe('Assignment and Reference AST Construction', () => {
                it('should construct element access nodes correctly', () => {
                        const arr = vec3(1, 2, 3)
                        const elem = arr.element(float(0))
                        expect(elem.type).toBe('element')
                        expect(elem.props.children?.[0]).toBe(arr)
                        expect(elem.props.children?.[1]?.type).toBe('conversion')
                })

                it('should handle conditional expression AST correctly', () => {
                        const condition = float(1.0).greaterThan(float(0.5))
                        const trueVal = vec3(1, 0, 0)
                        const falseVal = vec3(0, 1, 0)
                        const res = trueVal.select(falseVal, condition)
                        expect(res.type).toBe('ternary')
                        expect(res.props.children).toEqual([trueVal, falseVal, condition])
                })
        })
})
