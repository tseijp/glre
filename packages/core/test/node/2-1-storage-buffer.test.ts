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
                        const context = createWGPUContext()

                        const result = code(data, context)
                        expect(result).toBe('testBuffer')

                        const header = context.code?.headers.get('testBuffer')
                        expect(header).toContain('@group(0) @binding(0)')
                        expect(header).toContain('var<storage, read_write>')
                        expect(header).toContain('array<f32>')
                })

                it('should handle vector storage buffers in WGSL', () => {
                        const vectorData = storage(vec3(), 'vectorBuffer')
                        const context = createWGPUContext()

                        code(vectorData, context)
                        const header = context.code?.headers.get('vectorBuffer')
                        expect(header).toContain('array<vec3f>')
                })

                it('should handle vec4 storage buffers in WGSL', () => {
                        const vec4Data = storage(vec4(), 'vec4Buffer')
                        const context = createWGPUContext()

                        code(vec4Data, context)
                        const header = context.code?.headers.get('vec4Buffer')
                        expect(header).toContain('array<vec4f>')
                })

                it('should assign binding numbers automatically', () => {
                        const buffer1 = storage(float(), 'buffer1')
                        const buffer2 = storage(vec3(), 'buffer2')
                        const context = createWGPUContext()

                        code(buffer1, context)
                        code(buffer2, context)

                        const header1 = context.code?.headers.get('buffer1')
                        const header2 = context.code?.headers.get('buffer2')

                        expect(header1).toContain('@binding(0)')
                        expect(header2).toContain('@binding(1)')
                })
        })

        describe('Storage Buffer Header Generation - WebGL', () => {
                it('should generate correct WebGL texture buffer headers', () => {
                        const data = storage(float(), 'testBuffer')
                        const context = createWebGLContext()

                        code(data, context)
                        const header = context.code?.headers.get('testBuffer')
                        expect(header).toContain('uniform sampler2D testBuffer')
                })

                it('should handle compute shader output buffers in WebGL', () => {
                        const data = storage(vec4(), 'outputBuffer')
                        const context = createWebGLContext()
                        context.label = 'compute'

                        code(data, context)
                        const header = context.code?.headers.get('outputBuffer')
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
                        const context = createWGPUContext()

                        const elementAccess = data.element(index)
                        const result = code(elementAccess, context)
                        expect(result).toBe('buffer[i32(3)]')
                })

                it('should generate correct WebGL texture fetch code', () => {
                        const data = storage(float(), 'buffer')
                        const index = int(7)
                        const context = createWebGLContext()
                        context.gl = { particleCount: [32, 32] }

                        const elementAccess = data.element(index)
                        const result = code(elementAccess, context)
                        expect(result).toContain('texelFetch')
                        expect(result).toContain('ivec2')
                        expect(result).toContain('.x')
                })

                it('should handle vector storage element access', () => {
                        const vectorData = storage(vec3(), 'vectorBuffer')
                        const index = int(2)
                        const context = createWGPUContext()

                        const elementAccess = vectorData.element(index)
                        const result = code(elementAccess, context)
                        expect(result).toBe('vectorBuffer[i32(2)]')
                })

                it('should handle vec4 storage element access in WebGL', () => {
                        const vec4Data = storage(vec4(), 'vec4Buffer')
                        const index = int(1)
                        const context = createWebGLContext()
                        context.gl = { particleCount: [16, 16] }

                        const elementAccess = vec4Data.element(index)
                        const result = code(elementAccess, context)
                        expect(result).toContain('texelFetch')
                        expect(result).not.toContain('.x')
                })
        })

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
                        const context = createWGPUContext()

                        const assignment = data.element(index).assign(value)
                        const result = code(assignment, context)
                        expect(result).toBe('buffer[i32(3)] = 1.5;')
                })

                it('should generate correct WebGL scatter code', () => {
                        const data = storage(float(), 'buffer')
                        const index = int(7)
                        const value = float(3.14)
                        const context = createWebGLContext()

                        const assignment = data.element(index).assign(value)
                        const result = code(assignment, context)
                        expect(result).toBe('_buffer = vec4(3.14, 0.0, 0.0, 1.0);')
                })

                it('should handle vector storage assignment in WebGL', () => {
                        const data = storage(vec2(), 'vec2Buffer')
                        const index = int(2)
                        const value = vec2(1, 2)
                        const context = createWebGLContext()

                        const assignment = data.element(index).assign(value)
                        const result = code(assignment, context)
                        expect(result).toBe('_vec2Buffer = vec4(vec2(1.0, 2.0), 0.0, 1.0);')
                })

                it('should handle vec3 storage assignment in WebGL', () => {
                        const data = storage(vec3(), 'vec3Buffer')
                        const index = int(1)
                        const value = vec3(1, 2, 3)
                        const context = createWebGLContext()

                        const assignment = data.element(index).assign(value)
                        const result = code(assignment, context)
                        expect(result).toBe('_vec3Buffer = vec4(vec3(1.0, 2.0, 3.0), 1.0);')
                })

                it('should handle vec4 storage assignment correctly', () => {
                        const data = storage(vec4(), 'vec4Buffer')
                        const index = int(0)
                        const value = vec4(1, 2, 3, 4)
                        const context = createWGPUContext()

                        const assignment = data.element(index).assign(value)
                        const result = code(assignment, context)
                        expect(result).toBe('vec4Buffer[i32(0)] = vec4f(1.0, 2.0, 3.0, 4.0);')
                })
        })

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

                        const context = createWGPUContext()
                        const result = compute(computeFunc(id), context)

                        expect(result).toContain('@group(0) @binding(0) var<storage, read_write> input: array<f32>;')
                        expect(result).toContain('@group(0) @binding(1) var<storage, read_write> output: array<f32>;')
                        expect(result).toContain('input[')
                        expect(result).toContain('output[')
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

                        const context = createWGPUContext()
                        const result = compute(computeFunc(id), context)

                        expect(result).toContain('positions: array<vec3f>')
                        expect(result).toContain('velocities: array<vec3f>')
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

                        const context = createWGPUContext()
                        const result = compute(computeFunc(id), context)

                        expect(result).toContain('scalars: array<f32>')
                        expect(result).toContain('vectors: array<vec4f>')
                })
        })

        describe('Index Calculation and Boundary Handling', () => {
                it('should handle computed indices correctly', () => {
                        const data = storage(float(), 'buffer')
                        const baseIndex = int(5)
                        const offset = int(3)
                        const computedIndex = baseIndex.add(offset)
                        const context = createWGPUContext()

                        const elementAccess = data.element(computedIndex)
                        const result = code(elementAccess, context)
                        expect(result).toBe('buffer[(i32(5) + i32(3))]')
                })

                it('should handle variable indices', () => {
                        const data = storage(vec2(), 'buffer')
                        const dynamicIndex = int(0).toVar('index')
                        const context = createWGPUContext()

                        const elementAccess = data.element(dynamicIndex)
                        const result = code(elementAccess, context)
                        expect(result).toBe('buffer[index]')
                })

                it('should handle WebGL coordinate calculation for texture buffers', () => {
                        const data = storage(float(), 'textureBuffer')
                        const index = int(35)
                        const context = createWebGLContext()
                        context.gl = { particleCount: [8, 8] }

                        const elementAccess = data.element(index)
                        const result = code(elementAccess, context)
                        expect(result).toContain('int(i32(35)) % 8')
                        expect(result).toContain('int(i32(35)) / 8')
                })

                it('should handle different texture buffer sizes', () => {
                        const data = storage(vec3(), 'largeBuffer')
                        const index = int(100)
                        const context = createWebGLContext()
                        context.gl = { particleCount: [64, 64] }

                        const elementAccess = data.element(index)
                        const result = code(elementAccess, context)
                        expect(result).toContain('% 64')
                        expect(result).toContain('/ 64')
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
                        const context = createWGPUContext()

                        const element = data.element(index)
                        const normalized = element.normalize()
                        const result = code(normalized, context)
                        expect(result).toBe('normalize(data[i32(5)])')
                })

                it('should handle swizzle operations on storage elements', () => {
                        const data = storage(vec4(), 'colors')
                        const index = int(2)
                        const context = createWGPUContext()

                        const element = data.element(index)
                        const rgb = element.xyz
                        const result = code(rgb, context)
                        expect(result).toBe('colors[i32(2)].xyz')
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

                        expect(wgpuResult).toBe('buffer[i32(10)]')
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
