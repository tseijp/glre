import { describe, it, expect } from '@jest/globals'
import { float, int, vec2, vec3, vec4, storage, Fn, id } from '../../src/node'
import { compute } from '../../src/node/build'
import { code } from '../../src/node/utils'
import type { NodeContext } from '../../src/node/types'

describe('Storage Buffer Management', () => {
        const createWGPUContext = (): NodeContext => ({ isWebGL: false })
        const createWebGLContext = (): NodeContext => ({ isWebGL: true })

        describe('Storage Buffer Creation', () => {
                it('should create storage buffers with correct types', () => {
                        const floatData = storage(float(), 'floatBuffer')
                        const vecData = storage(vec3(), 'vectorBuffer')
                        const vec4Data = storage(vec4(), 'vec4Buffer')
                        expect(floatData.type).toBe('storage')
                        expect(floatData.props.id).toBe('floatBuffer')
                        expect(vecData.type).toBe('storage')
                        expect(vecData.props.id).toBe('vectorBuffer')
                        expect(vec4Data.type).toBe('storage')
                        expect(vec4Data.props.id).toBe('vec4Buffer')
                })

                it('should auto-generate storage IDs when not provided', () => {
                        const data = storage(float())
                        expect(data.type).toBe('storage')
                        expect(data.props.id).toMatch(/x\d+/)
                })

                it('should handle different storage buffer types', () => {
                        const intData = storage(int(), 'intBuffer')
                        const vec2Data = storage(vec2(), 'vec2Buffer')
                        expect(intData.props.id).toBe('intBuffer')
                        expect(vec2Data.props.id).toBe('vec2Buffer')
                })
        })

        describe('Storage Buffer Header Generation - WGPU', () => {
                it('should generate correct WGSL storage buffer headers', () => {
                        const data = storage(float(), 'testBuffer')
                        const c = createWGPUContext()
                        const res = code(data, c)
                        expect(res).toBe('testBuffer')
                        const header = c.code?.headers.get('testBuffer')
                        expect(header).toContain('@group(0) @binding(0)')
                        expect(header).toContain('var<storage, read_write>')
                        expect(header).toContain('array<f32>')
                })

                it('should handle vector storage buffers in WGSL', () => {
                        const vectorData = storage(vec3(), 'vectorBuffer')
                        const c = createWGPUContext()
                        code(vectorData, c)
                        const header = c.code?.headers.get('vectorBuffer')
                        expect(header).toContain('array<vec3f>')
                })

                it('should handle vec4 storage buffers in WGSL', () => {
                        const vec4Data = storage(vec4(), 'vec4Buffer')
                        const c = createWGPUContext()
                        code(vec4Data, c)
                        const header = c.code?.headers.get('vec4Buffer')
                        expect(header).toContain('array<vec4f>')
                })

                it('should assign binding numbers automatically', () => {
                        const buffer1 = storage(float(), 'buffer1')
                        const buffer2 = storage(vec3(), 'buffer2')
                        const c = createWGPUContext()
                        code(buffer1, c)
                        code(buffer2, c)
                        const header1 = c.code?.headers.get('buffer1')
                        expect(header1).toContain('@binding(0)')
                        // @TODO FIX #128 Unit tests lack gl object, so no auto-binding
                        // const header2 = c.code?.headers.get('buffer2')
                        // expect(header2).toContain('@binding(1)')
                })
        })

        describe('Storage Buffer Header Generation - WebGL', () => {
                it('should generate correct WebGL texture buffer headers', () => {
                        const data = storage(float(), 'testBuffer')
                        const c = createWebGLContext()
                        code(data, c)
                        const header = c.code?.headers.get('testBuffer')
                        expect(header).toContain('uniform sampler2D testBuffer')
                })

                it('should handle compute shader output buffers in WebGL', () => {
                        const data = storage(vec4(), 'outputBuffer')
                        const c = createWebGLContext()
                        c.label = 'compute'
                        code(data, c)
                        const header = c.code?.headers.get('outputBuffer')
                        expect(header).toContain('uniform sampler2D outputBuffer')
                        expect(header).toContain('out vec4 _outputBuffer')
                })
        })

        describe('Element Access Operations', () => {
                it('should handle storage buffer element access correctly', () => {
                        const data = storage(float(), 'buffer')
                        const index = int(5)
                        const element = data.element(index)
                        expect(element.type).toBe('gather')
                        expect(element.props.children?.[0]).toBe(data)
                        expect(element.props.children?.[1]).toBe(index)
                })

                it('should generate correct WGSL element access code', () => {
                        const data = storage(float(), 'buffer')
                        const index = int(3)
                        const c = createWGPUContext()
                        const elementAccess = data.element(index)
                        const res = code(elementAccess, c)
                        expect(res).toBe('buffer[3]')
                })

                it('should generate correct WebGL texture fetch code', () => {
                        const data = storage(float(), 'buffer')
                        const index = int(7)
                        const c = createWebGLContext()
                        c.gl = { particleCount: [32, 32] }
                        const elementAccess = data.element(index)
                        const res = code(elementAccess, c)
                        expect(res).toContain('texelFetch')
                        expect(res).toContain('ivec2')
                        expect(res).toContain('.x')
                })

                it('should handle vector storage element access', () => {
                        const vectorData = storage(vec3(), 'vectorBuffer')
                        const index = int(2)
                        const c = createWGPUContext()
                        const elementAccess = vectorData.element(index)
                        const res = code(elementAccess, c)
                        expect(res).toBe('vectorBuffer[2]')
                })

                it('should handle vec4 storage element access in WebGL', () => {
                        const vec4Data = storage(vec4(), 'vec4Buffer')
                        const index = int(1)
                        const c = createWebGLContext()
                        c.gl = { particleCount: [16, 16] }
                        const elementAccess = vec4Data.element(index)
                        const res = code(elementAccess, c)
                        expect(res).toContain('texelFetch')
                        expect(res).not.toContain('.x')
                })
        })

        /**
         * @TODO FIX #128
        describe('Element Assignment Operations', () => {
                it('should handle storage buffer element assignment', () => {
                        const data = storage(float(), 'buffer')
                        const index = int(5)
                        const value = float(2.5)
                        const element = data.element(index)
                        const assignment = element.assign(value)
                        expect(assignment.type).toBe('scatter')
                        expect(assignment.props.children?.[0]).toBe(element)
                        expect(assignment.props.children?.[1]).toBe(value)
                })

                it('should generate correct WGSL element assignment code', () => {
                        const data = storage(float(), 'buffer')
                        const index = int(3)
                        const value = float(1.5)
                        const c = createWGPUContext()
                        const assignment = data.element(index).assign(value)
                        const res = code(assignment, c)
                        expect(res).toBe('buffer[3] = 1.5;')
                })

                it('should generate correct WebGL scatter code', () => {
                        const data = storage(float(), 'buffer')
                        const index = int(7)
                        const value = float(3.14)
                        const c = createWebGLContext()
                        const assignment = data.element(index).assign(value)
                        const res = code(assignment, c)
                        expect(res).toBe('_buffer = vec4(3.14, 0.0, 0.0, 1.0);')
                })

                it('should handle vector storage assignment in WebGL', () => {
                        const data = storage(vec2(), 'vec2Buffer')
                        const index = int(2)
                        const value = vec2(1, 2)
                        const c = createWebGLContext()
                        const assignment = data.element(index).assign(value)
                        const res = code(assignment, c)
                        expect(res).toBe('_vec2Buffer = vec4(vec2(1.0, 2.0), 0.0, 1.0);')
                })

                it('should handle vec3 storage assignment in WebGL', () => {
                        const data = storage(vec3(), 'vec3Buffer')
                        const index = int(1)
                        const value = vec3(1, 2, 3)
                        const c = createWebGLContext()
                        const assignment = data.element(index).assign(value)
                        const res = code(assignment, c)
                        expect(res).toBe('_vec3Buffer = vec4(vec3(1.0, 2.0, 3.0), 1.0);')
                })

                it('should handle vec4 storage assignment correctly', () => {
                        const data = storage(vec4(), 'vec4Buffer')
                        const index = int(0)
                        const value = vec4(1, 2, 3, 4)
                        const c = createWGPUContext()
                        const assignment = data.element(index).assign(value)
                        const res = code(assignment, c)
                        expect(res).toBe('vec4Buffer[0] = vec4f(1.0, 2.0, 3.0, 4.0);')
                })
        })
         */

        describe('Storage Buffer in Compute Shaders', () => {
                it('should generate storage buffer usage in compute shaders', () => {
                        const inputBuffer = storage(float(), 'input')
                        const outputBuffer = storage(float(), 'output')
                        const computeFunc = Fn(([id]) => {
                                const index = id.x
                                const value = inputBuffer.element(index)
                                const doubled = value.mul(float(2.0))
                                outputBuffer.element(index).assign(doubled)
                        })
                        const c = createWGPUContext()
                        const res = compute(computeFunc(id), c)
                        expect(res).toContain('@group(0) @binding(0) var<storage, read_write> input: array<f32>;')
                        // @TODO FIX #128 Unit tests lack gl object, so no auto-binding
                        // expect(res).toContain('@group(0) @binding(1) var<storage, read_write> output: array<f32>;')
                        expect(res).toContain('input[')
                        expect(res).toContain('output[')
                })

                it('should handle vector storage in compute shaders', () => {
                        const positionBuffer = storage(vec3(), 'positions')
                        const velocityBuffer = storage(vec3(), 'velocities')
                        const computeFunc = Fn(([id]) => {
                                const index = id.x
                                const pos = positionBuffer.element(index)
                                const vel = velocityBuffer.element(index)
                                const newPos = pos.add(vel)
                                positionBuffer.element(index).assign(newPos)
                        })
                        const c = createWGPUContext()
                        const res = compute(computeFunc(id), c)
                        expect(res).toContain('positions: array<vec3f>')
                        expect(res).toContain('velocities: array<vec3f>')
                })

                it('should handle mixed storage buffer types', () => {
                        const scalarData = storage(float(), 'scalars')
                        const vectorData = storage(vec4(), 'vectors')
                        const computeFunc = Fn(([id]) => {
                                const index = id.x
                                const scalar = scalarData.element(index)
                                const vector = vectorData.element(index)
                                const scaled = vector.mul(scalar)
                                vectorData.element(index).assign(scaled)
                        })
                        const c = createWGPUContext()
                        const res = compute(computeFunc(id), c)
                        expect(res).toContain('scalars: array<f32>')
                        expect(res).toContain('vectors: array<vec4f>')
                })
        })

        describe('Index Calculation and Boundary Handling', () => {
                it('should handle computed indices correctly', () => {
                        const data = storage(float(), 'buffer')
                        const baseIndex = int(5)
                        const offset = int(3)
                        const computedIndex = baseIndex.add(offset)
                        const c = createWGPUContext()
                        const elementAccess = data.element(computedIndex)
                        const res = code(elementAccess, c)
                        expect(res).toBe('buffer[(5 + 3)]')
                })

                it('should handle variable indices', () => {
                        const data = storage(vec2(), 'buffer')
                        const dynamicIndex = int(0).toVar('index')
                        const c = createWGPUContext()
                        const elementAccess = data.element(dynamicIndex)
                        const res = code(elementAccess, c)
                        expect(res).toBe('buffer[index]')
                })

                it('should handle WebGL coordinate calculation for texture buffers', () => {
                        const data = storage(float(), 'textureBuffer')
                        const index = int(35)
                        const c = createWebGLContext()
                        c.gl = { particleCount: [8, 8] }
                        const elementAccess = data.element(index)
                        const res = code(elementAccess, c)
                        expect(res).toContain('int(35) % 8')
                        expect(res).toContain('int(35) / 8')
                })

                it('should handle different texture buffer sizes', () => {
                        const data = storage(vec3(), 'largeBuffer')
                        const index = int(100)
                        const c = createWebGLContext()
                        c.gl = { particleCount: [64, 64] }
                        const elementAccess = data.element(index)
                        const res = code(elementAccess, c)
                        expect(res).toContain('% 64')
                        expect(res).toContain('/ 64')
                })
        })

        describe('Storage Buffer Type Inference', () => {
                it('should preserve element types through storage operations', () => {
                        const floatBuffer = storage(float(), 'floats')
                        const vecBuffer = storage(vec3(), 'vectors')
                        const floatElement = floatBuffer.element(int(0))
                        const vecElement = vecBuffer.element(int(1))
                        expect(floatElement.type).toBe('gather')
                        expect(vecElement.type).toBe('gather')
                })

                it('should handle chained operations on storage elements', () => {
                        const data = storage(vec3(), 'data')
                        const index = int(5)
                        const c = createWGPUContext()
                        const element = data.element(index)
                        const normalized = element.normalize()
                        const res = code(normalized, c)
                        expect(res).toBe('normalize(data[5])')
                })

                it('should handle swizzle operations on storage elements', () => {
                        const data = storage(vec4(), 'colors')
                        const index = int(2)
                        const c = createWGPUContext()
                        const element = data.element(index)
                        const rgb = element.xyz
                        const res = code(rgb, c)
                        expect(res).toBe('colors[2].xyz')
                })
        })

        describe('Platform-Specific Storage Differences', () => {
                it('should generate different storage syntax for WebGL vs WebGPU', () => {
                        const data = storage(float(), 'buffer')
                        const index = int(10)
                        const wgpuContext = createWGPUContext()
                        const webglContext = createWebGLContext()
                        webglContext.gl = { particleCount: [16, 16] }
                        const elementAccess = data.element(index)
                        const wgpuResult = code(elementAccess, wgpuContext)
                        const webglResult = code(elementAccess, webglContext)
                        expect(wgpuResult).toBe('buffer[10]')
                        expect(webglResult).toContain('texelFetch')
                        expect(webglResult).toContain('ivec2')
                })

                it('should handle storage declaration differences', () => {
                        const vectorData = storage(vec2(), 'vectors')
                        const wgpuContext = createWGPUContext()
                        const webglContext = createWebGLContext()
                        code(vectorData, wgpuContext)
                        code(vectorData, webglContext)
                        const wgpuHeader = wgpuContext.code?.headers.get('vectors')
                        const webglHeader = webglContext.code?.headers.get('vectors')
                        expect(wgpuHeader).toContain('var<storage, read_write>')
                        expect(wgpuHeader).toContain('array<vec2f>')
                        expect(webglHeader).toContain('uniform sampler2D')
                })
        })
})
