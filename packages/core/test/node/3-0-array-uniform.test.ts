import { describe, expect, it } from 'vitest'
import { float, int, uniformArray, instancedArray, attributeArray, vec3, vec4 } from '../../src/node'
import { infer } from '../../src/node/utils/infer'
import { code } from '../../src/node/utils'
import type { NodeContext } from '../../src/node/types'

describe('Array Node System', () => {
        const wgpu = (): NodeContext => ({ isWebGL: false })
        const webgl = (): NodeContext => ({ isWebGL: true })

        describe('Node Creation', () => {
                it('should create uniformArray with correct type', () => {
                        const arr = uniformArray(vec3(), 'colors', 3)
                        expect(arr.type).toBe('uniformArray')
                        expect(arr.props.id).toBe('colors')
                        expect(arr.isProxy).toBe(true)
                })

                it('should store count in args', () => {
                        const arr = uniformArray(vec3(), 'colors', 16)
                        expect(arr.props.args?.[0]).toBe(16)
                })

                it('should auto-generate id when not provided', () => {
                        const arr = uniformArray(vec3())
                        expect(arr.props.id).toMatch(/x\d+/)
                })

                it('should create uniformArray without count', () => {
                        const arr = uniformArray(float(), 'scalars')
                        expect(arr.type).toBe('uniformArray')
                        expect(arr.props.args?.length ?? 0).toBe(0)
                })

                it('should create instancedArray with correct type', () => {
                        const arr = instancedArray(vec3(), 'offsets')
                        expect(arr.type).toBe('instanceArray')
                        expect(arr.props.id).toBe('offsets')
                })

                it('should create attributeArray with correct type', () => {
                        const arr = attributeArray(float(), 'weights')
                        expect(arr.type).toBe('attributeArray')
                        expect(arr.props.id).toBe('weights')
                })
        })

        describe('Type Inference', () => {
                it('should infer element type from vec3 uniformArray', () => {
                        const arr = uniformArray(vec3(), 'colors', 3)
                        expect(infer(arr)).toBe('vec3')
                })

                it('should infer element type from float uniformArray', () => {
                        const arr = uniformArray(float(), 'scalars', 8)
                        expect(infer(arr)).toBe('float')
                })

                it('should infer element type from int uniformArray', () => {
                        const arr = uniformArray(int(), 'indices', 4)
                        expect(infer(arr)).toBe('int')
                })

                it('should infer element type from vec4 uniformArray', () => {
                        const arr = uniformArray(vec4(), 'quads', 2)
                        expect(infer(arr)).toBe('vec4')
                })

                it('should infer correct element type through .element() access', () => {
                        const arr = uniformArray(vec3(), 'colors', 3)
                        const elem = arr.element(int(1))
                        expect(infer(elem)).toBe('vec3')
                })

                it('should infer float element type through .element() on float array', () => {
                        const arr = uniformArray(float(), 'values', 4)
                        const elem = arr.element(int(0))
                        expect(infer(elem)).toBe('float')
                })
        })

        describe('Element Access - AST', () => {
                it('should create element node via .element()', () => {
                        const arr = uniformArray(vec3(), 'colors', 3)
                        const elem = arr.element(int(1))
                        expect(elem.type).toBe('element')
                })

                it('should store array node and index as children in element node', () => {
                        const arr = uniformArray(vec3(), 'colors', 3)
                        const idx = int(2)
                        const elem = arr.element(idx)
                        expect(elem.props.children?.[0]).toBe(arr)
                        expect(elem.props.children?.[1]).toBe(idx)
                })

                it('should support dynamic index node in .element()', () => {
                        const arr = uniformArray(float(), 'vals', 8)
                        const dynIdx = int(0).toVar('i')
                        const elem = arr.element(dynIdx)
                        expect(elem.type).toBe('element')
                })
        })

        describe('Element Access - Code Generation', () => {
                it('should generate array element access in WGSL', () => {
                        const arr = uniformArray(vec3(), 'colors', 3)
                        const c = wgpu()
                        const res = code(arr.element(int(1)), c)
                        expect(res).toBe('colors[1]')
                })

                it('should generate array element access in GLSL', () => {
                        const arr = uniformArray(vec3(), 'colors', 3)
                        const c = webgl()
                        const res = code(arr.element(int(1)), c)
                        expect(res).toBe('colors[1]')
                })

                it('should support dynamic index in element access', () => {
                        const arr = uniformArray(float(), 'vals', 8)
                        const idx = int(0).toVar('i')
                        const c = wgpu()
                        code(idx, c)
                        const res = code(arr.element(idx), c)
                        expect(res).toBe('vals[i]')
                })

                it('should support chained operations on element access', () => {
                        const arr = uniformArray(vec3(), 'colors', 3)
                        const c = wgpu()
                        const res = code(arr.element(int(0)).normalize(), c)
                        expect(res).toBe('normalize(colors[0])')
                })

                it('should support swizzle on element access', () => {
                        const arr = uniformArray(vec4(), 'vecs', 4)
                        const c = wgpu()
                        const res = code(arr.element(int(0)).xyz, c)
                        expect(res).toBe('vecs[0].xyz')
                })
        })

        describe('Header Generation - WGSL (uniformArray)', () => {
                it('should generate uniform array header with count', () => {
                        const arr = uniformArray(vec3(), 'iOffset', 16)
                        const c = wgpu()
                        code(arr, c)
                        const header = c.code?.headers.get('iOffset')
                        expect(header).toContain('var<uniform>')
                        expect(header).toContain('array<vec3f, 16>')
                        expect(header).toContain('@group(0) @binding(0)')
                })

                it('should generate uniform array header without count', () => {
                        const arr = uniformArray(float(), 'vals')
                        const c = wgpu()
                        code(arr, c)
                        const header = c.code?.headers.get('vals')
                        expect(header).toContain('var<uniform>')
                        expect(header).toContain('array<f32>')
                })

                it('should generate float array header in WGSL', () => {
                        const arr = uniformArray(float(), 'scalars', 8)
                        const c = wgpu()
                        code(arr, c)
                        const header = c.code?.headers.get('scalars')
                        expect(header).toContain('array<f32, 8>')
                })

                it('should return id as the code expression', () => {
                        const arr = uniformArray(vec3(), 'colors', 3)
                        const c = wgpu()
                        const res = code(arr, c)
                        expect(res).toBe('colors')
                })
        })

        describe('Header Generation - GLSL (uniformArray)', () => {
                it('should generate uniform array declaration in GLSL', () => {
                        const arr = uniformArray(vec3(), 'iOffset', 16)
                        const c = webgl()
                        code(arr, c)
                        const header = c.code?.headers.get('iOffset')
                        expect(header).toBe('uniform vec3 iOffset[16];')
                })

                it('should generate float uniform array in GLSL', () => {
                        const arr = uniformArray(float(), 'scalars', 4)
                        const c = webgl()
                        code(arr, c)
                        const header = c.code?.headers.get('scalars')
                        expect(header).toBe('uniform float scalars[4];')
                })

                it('should generate uniform array without count in GLSL', () => {
                        const arr = uniformArray(vec4(), 'quads')
                        const c = webgl()
                        code(arr, c)
                        const header = c.code?.headers.get('quads')
                        expect(header).toContain('uniform vec4 quads')
                })

                it('should return id as the code expression in GLSL', () => {
                        const arr = uniformArray(vec3(), 'colors', 3)
                        const c = webgl()
                        const res = code(arr, c)
                        expect(res).toBe('colors')
                })
        })

        describe('instancedArray and attributeArray', () => {
                it('instancedArray should have instanceArray node type', () => {
                        const arr = instancedArray(vec3(), 'offsets')
                        expect(arr.type).toBe('instanceArray')
                })

                it('attributeArray should have attributeArray node type', () => {
                        const arr = attributeArray(float(), 'weights')
                        expect(arr.type).toBe('attributeArray')
                })

                it('instancedArray should infer element type correctly', () => {
                        const arr = instancedArray(vec3(), 'offsets')
                        expect(infer(arr)).toBe('vec3')
                })

                it('instancedArray element access should generate correct code', () => {
                        const arr = instancedArray(vec3(), 'offsets')
                        const c = wgpu()
                        const res = code(arr.element(int(0)), c)
                        expect(res).toBe('offsets[0]')
                })
        })
})
