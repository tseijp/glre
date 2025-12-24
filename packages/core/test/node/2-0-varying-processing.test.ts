import { describe, it, expect } from '@jest/globals'
import { vec3, float, vec4, Fn, varying, position, Scope } from '../../src/node'
import { fragment, vertex } from '../../src/node/build'
import type { NodeContext } from '../../src/node/types'

describe('Varying Processing System', () => {
        const createVertexContext = (): NodeContext => ({ isWebGL: false, label: 'vert' })
        const createFragmentContext = (): NodeContext => ({ isWebGL: false, label: 'frag' })
        const createGLSLVertexContext = (): NodeContext => ({ isWebGL: true, label: 'vert' })
        const createGLSLFragmentContext = (): NodeContext => ({ isWebGL: true, label: 'frag' })

        describe('Varying Variable Detection', () => {
                it('should detect varying variables through varying usage', () => {
                        const worldPos = vec3(1, 2, 3)
                        const vWorldPos = varying(worldPos, 'worldPosition')
                        expect(vWorldPos.type).toBe('varying')
                        expect(vWorldPos.props.id).toBe('worldPosition')
                        expect(vWorldPos.props.inferFrom?.[0]).toBe(worldPos)
                })

                it('should handle multiple varying variables', () => {
                        const pos = vec3(1, 2, 3)
                        const norm = vec3(0, 1, 0)
                        const uv = vec3(0.5, 0.5, 0)
                        const vPos = varying(pos, 'vPosition')
                        const vNorm = varying(norm, 'vNormal')
                        const vUV = varying(uv, 'vUV')
                        expect(vPos.props.id).toBe('vPosition')
                        expect(vNorm.props.id).toBe('vNormal')
                        expect(vUV.props.id).toBe('vUV')
                })

                it('should auto-generate varying IDs when not provided', () => {
                        const data = vec4(1, 2, 3, 4)
                        const varying = varying(data)
                        expect(varying.type).toBe('varying')
                        expect(varying.props.id).toMatch(/x\d+/)
                })
        })

        describe('Vertex Shader Varying Output Generation', () => {
                it('should generate correct WGSL vertex output struct with varyings', () => {
                        const vs = Scope(() => {
                                const worldPos = vec3(1, 2, 3)
                                const _varying = varying(worldPos, 'worldPosition')
                                return position
                        })
                        const c = createVertexContext()
                        const res = vertex(vs, c)
                        expect(res).toContain('struct Out {')
                        expect(res).toContain('@location(0) worldPosition: vec3f')
                        expect(res).toContain('out.worldPosition =')
                })

                it('should generate correct GLSL vertex output with varyings', () => {
                        const vs = Scope(() => {
                                const worldPos = vec3(1, 2, 3)
                                const _varying = varying(worldPos, 'worldPosition')
                                return position
                        })
                        const c = createGLSLVertexContext()
                        const res = vertex(vs, c)
                        expect(res).toContain('out vec3 worldPosition;')
                        expect(res).toContain('worldPosition =')
                })

                it('should handle multiple varyings in vertex shader output', () => {
                        const vs = Scope(() => {
                                const pos = vec3(1, 2, 3)
                                const norm = vec3(0, 1, 0)
                                const color = vec3(1, 0, 0)
                                const vPos = varying(pos, 'vPosition')
                                const vNorm = varying(norm, 'vNormal')
                                const vColor = varying(color, 'vColor')
                                return position
                        })
                        const c = createVertexContext()
                        const res = vertex(vs, c)
                        expect(res).toContain('@location(0) vPosition: vec3f')
                        expect(res).toContain('@location(1) vNormal: vec3f')
                        expect(res).toContain('@location(2) vColor: vec3f')
                        expect(res).toContain('out.vPosition =')
                        expect(res).toContain('out.vNormal =')
                        expect(res).toContain('out.vColor =')
                })
        })

        describe('Fragment Shader Varying Input Generation', () => {
                it('should generate correct WGSL fragment input struct with varyings', () => {
                        const vs = Scope(() => {
                                const worldPos = vec3(1, 2, 3)
                                varying(worldPos, 'worldPosition')
                                return position
                        })
                        const fs = Scope(() => {
                                const worldPos = vec3(1, 2, 3)
                                const varying = varying(worldPos, 'worldPosition')
                                return vec4(varying, 1)
                        })
                        vertex(vs, createVertexContext())
                        const c = createFragmentContext()
                        const res = fragment(fs, c)
                        expect(res).toContain('struct Out {')
                        expect(res).toContain('@location(0) worldPosition: vec3f')
                })

                it('should generate correct GLSL fragment input with varyings', () => {
                        const vs = Scope(() => {
                                const worldPos = vec3(1, 2, 3)
                                varying(worldPos, 'worldPosition')
                                return position
                        })
                        const fs = Scope(() => {
                                const worldPos = vec3(1, 2, 3)
                                const varying = varying(worldPos, 'worldPosition')
                                return vec4(varying, 1)
                        })
                        vertex(vs, createGLSLVertexContext())
                        const c = createGLSLFragmentContext()
                        const res = fragment(fs, c)
                        expect(res).toContain('in vec3 worldPosition;')
                })

                it('should handle varying access in fragment shader', () => {
                        const fs = Scope(() => {
                                const worldPos = vec3(1, 2, 3)
                                const varying = varying(worldPos, 'worldPosition')
                                const normalized = varying.normalize()
                                return vec4(normalized, 1)
                        })
                        const c = createFragmentContext()
                        const res = fragment(fs, c)
                        expect(res).toContain('normalize')
                        expect(res).toContain('out.worldPosition')
                })
        })

        describe('Varying Type Consistency', () => {
                it('should maintain type consistency between vertex and fragment shaders', () => {
                        const vs = Scope(() => {
                                const color = vec3(1, 0.5, 0.2)
                                const vColor = varying(color, 'vertexColor')
                                return position
                        })
                        const fs = Scope(() => {
                                const color = vec3(1, 0.5, 0.2)
                                const vColor = varying(color, 'vertexColor')
                                return vec4(vColor, 1)
                        })
                        const vertexContext = createVertexContext()
                        const fragmentContext = createFragmentContext()
                        const vertexResult = vertex(vs, vertexContext)
                        const fragmentResult = fragment(fs, fragmentContext)
                        expect(vertexResult).toContain('vertexColor: vec3f')
                        expect(fragmentResult).toContain('vertexColor: vec3f')
                })

                it('should handle scalar varying types correctly', () => {
                        const vs = Scope(() => {
                                const depth = float(0.5)
                                const vDepth = varying(depth, 'depth')
                                return position
                        })
                        const c = createVertexContext()
                        const res = vertex(vs, c)
                        expect(res).toContain('depth: f32')
                        expect(res).toContain('out.depth =')
                })

                it('should handle vec4 varying types correctly', () => {
                        const vs = Scope(() => {
                                const data = vec4(1, 2, 3, 4)
                                const vData = varying(data, 'data')
                                return position
                        })
                        const c = createVertexContext()
                        const res = vertex(vs, c)
                        expect(res).toContain('data: vec4f')
                })
        })

        describe('Varying Location Assignment', () => {
                it('should assign location numbers sequentially', () => {
                        const vs = Scope(() => {
                                const first = vec3(1, 2, 3)
                                const second = vec3(4, 5, 6)
                                const third = vec3(7, 8, 9)
                                const v1 = varying(first, 'first')
                                const v2 = varying(second, 'second')
                                const v3 = varying(third, 'third')
                                return position
                        })
                        const c = createVertexContext()
                        const res = vertex(vs, c)
                        expect(res).toContain('@location(0) first')
                        expect(res).toContain('@location(1) second')
                        expect(res).toContain('@location(2) third')
                })

                it('should start location numbering from 0', () => {
                        const vs = Scope(() => {
                                const normal = vec3(0, 1, 0)
                                const vNormal = varying(normal, 'normal')
                                return position
                        })
                        const c = createVertexContext()
                        const res = vertex(vs, c)
                        expect(res).toContain('@location(0) normal')
                })
        })

        describe('Platform-Specific Varying Differences', () => {
                it('should generate different syntax for WebGL vs WebGPU varyings', () => {
                        const vs = Scope(() => {
                                const uv = vec3(0.5, 0.5, 0)
                                const vUV = varying(uv, 'texCoord')
                                return position
                        })
                        const wgslContext = createVertexContext()
                        const glslContext = createGLSLVertexContext()
                        const wgslResult = vertex(vs, wgslContext)
                        const glslResult = vertex(vs, glslContext)
                        expect(wgslResult).toContain('@location(0) texCoord: vec3f')
                        expect(wgslResult).toContain('out.texCoord =')
                        expect(glslResult).toContain('out vec3 texCoord;')
                        expect(glslResult).toContain('texCoord =')
                })

                it('should handle varying access differently in fragment shaders', () => {
                        const fs = Scope(() => {
                                const uv = vec3(0.5, 0.5, 0)
                                const vUV = varying(uv, 'texCoord')
                                return vec4(vUV, 1)
                        })
                        const wgslContext = createFragmentContext()
                        const glslContext = createGLSLFragmentContext()
                        const wgslResult = fragment(fs, wgslContext)
                        const glslResult = fragment(fs, glslContext)
                        expect(wgslResult).toContain('out.texCoord')
                        expect(glslResult).toContain('texCoord')
                })
        })

        describe('Varying Processing Edge Cases', () => {
                it('should handle varying with computed expressions', () => {
                        const vs = Scope(() => {
                                const base = vec3(1, 2, 3)
                                const computed = base.normalize().mul(float(2.0))
                                const _vComputed = varying(computed, 'computed')
                                return position
                        })
                        const c = createVertexContext()
                        const res = vertex(vs, c)
                        expect(res).toContain('computed: vec3f')
                        expect(res).toContain('normalize')
                        expect(res).toContain('* 2.0')
                })

                it('should handle varying with function call ress', () => {
                        const mathFunc = Fn(([x]) => {
                                return x.sin().cos()
                        })
                        const vs = Scope(() => {
                                const input = vec3(1, 2, 3)
                                const res = mathFunc(input)
                                const _vResult = varying(res, 'processed')
                                return position
                        })
                        const c = createVertexContext()
                        const res = vertex(vs, c)
                        expect(res).toContain('processed: vec3f')
                        expect(res).toContain('sin')
                        expect(res).toContain('cos')
                })

                it('should handle varying reuse across multiple shaders', () => {
                        const createSharedVarying = () => {
                                const shared = vec3(1, 0.5, 0.2)
                                return varying(shared, 'sharedData')
                        }
                        const vs = Scope(() => {
                                const vShared = createSharedVarying()
                                return position
                        })
                        const fs = Scope(() => {
                                const vShared = createSharedVarying()
                                return vec4(vShared, 1)
                        })
                        const vertexContext = createVertexContext()
                        const fragmentContext = createFragmentContext()
                        const vertexResult = vertex(vs, vertexContext)
                        const fragmentResult = fragment(fs, fragmentContext)
                        expect(vertexResult).toContain('sharedData: vec3f')
                        expect(fragmentResult).toContain('sharedData: vec3f')
                })

                it('should handle empty varying lists correctly', () => {
                        const vs = Scope(() => {
                                return position
                        })
                        const fs = Scope(() => {
                                return vec4(1, 1, 1, 1)
                        })
                        const vertexContext = createVertexContext()
                        const fragmentContext = createFragmentContext()
                        const vertexResult = vertex(vs, vertexContext)
                        const fragmentResult = fragment(fs, fragmentContext)
                        expect(vertexResult).not.toContain('@location(')
                        expect(fragmentResult).not.toContain('@location(')
                })
        })
})
