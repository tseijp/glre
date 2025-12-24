import { describe, expect, it } from '@jest/globals'
import { float, Fn, position, Scope, varying, vec3, vec4 } from '../../src/node'
import type { NodeContext } from '../../src/node/types'

describe('Varying Processing System', () => {
        const ctx = (isWebGL = false) => ({ isWebGL } as NodeContext)

        describe('Varying Variable Detection', () => {
                it('should detect varying variables through varying usage', () => {
                        const worldPos = vec3(1, 2, 3)
                        const vWorldPos = varying(worldPos, 'worldPosition')
                        expect(vWorldPos.type).toBe('varying')
                        expect(vWorldPos.props.id).toBe('worldPosition')
                        expect(vWorldPos.props.inferFrom?.[0]).toBe(worldPos)
                })

                it('should handle multiple varying variables', () => {
                        const pos = varying(vec3(1, 2, 3), 'position')
                        const norm = varying(vec3(0, 1, 0), 'normal')
                        const uv = varying(vec3(0.5, 0.5, 0), 'uv')
                        expect(pos.props.id).toBe('position')
                        expect(norm.props.id).toBe('normal')
                        expect(uv.props.id).toBe('uv')
                })

                it('should auto-generate varying IDs when not provided', () => {
                        const data = varying(vec4(1, 2, 3, 4))
                        expect(data.type).toBe('varying')
                        expect(data.props.id).toMatch(/x\d+/)
                })
        })

        describe('Vertex Shader Varying Output Generation', () => {
                it('should generate correct WGSL vertex output struct with varyings', () => {
                        const pos = varying<'vec3'>(vec3(), 'pos')
                        const vs = Scope(() => {
                                pos.assign(vec3(1, 2, 3))
                                return vec4(position, 1)
                        })
                        const res = vs.vertex(ctx())
                        expect(res).toContain('struct Out {')
                        expect(res).toContain('@location(0) pos: vec3f')
                        expect(res).toContain('out.pos =')
                })

                it('should generate correct GLSL vertex output with varyings', () => {
                        const pos = varying(vec3(), 'pos')
                        const vs = Scope(() => {
                                pos.assign(vec3(1, 2, 3))
                                return vec4(position, 1)
                        })
                        const res = vs.vertex(ctx(true))
                        expect(res).toContain('out vec3 pos;')
                        expect(res).toContain('pos =')
                })

                it('should handle multiple varyings in vertex shader output', () => {
                        const pos = varying(vec3(), 'pos')
                        const norm = varying(vec3(), 'norm')
                        const color = varying(vec3(), 'color')
                        const vs = Scope(() => {
                                pos.assign(vec3(1, 2, 3))
                                norm.assign(vec3(0, 1, 0))
                                color.assign(vec3(1, 0, 0))
                                return vec4(position, 1)
                        })
                        const res = vs.vertex(ctx())
                        expect(res).toContain('@location(0) pos: vec3f')
                        expect(res).toContain('@location(1) norm: vec3f')
                        expect(res).toContain('@location(2) color: vec3f')
                        expect(res).toContain('out.pos =')
                        expect(res).toContain('out.norm =')
                        expect(res).toContain('out.color =')
                })
        })

        describe('Fragment Shader Varying Input Generation', () => {
                it('should generate correct WGSL fragment input struct with varyings', () => {
                        const pos = varying(vec3(), 'pos')
                        const vs = Scope(() => {
                                pos.assign(vec3(1, 2, 3))
                                return vec4(position, 1)
                        })
                        const fs = vec4(pos, 1)
                        vs.vertex(ctx())
                        const res = fs.fragment(ctx())
                        expect(res).toContain('struct Out {')
                        expect(res).toContain('@location(0) pos: vec3f')
                })

                it('should generate correct GLSL fragment input with varyings', () => {
                        const pos = varying(vec3(), 'pos')
                        const vs = Scope(() => {
                                pos.assign(vec3(1, 2, 3))
                                return vec4(position, 1)
                        })
                        const fs = vec4(pos, 1)
                        vs.vertex(ctx(true))
                        const res = fs.fragment(ctx(true))
                        expect(res).toContain('in vec3 pos;')
                })

                it('should handle varying access in fragment shader', () => {
                        const fs = Scope(() => {
                                const pos = varying(vec3(1, 2, 3), 'pos')
                                const norm = pos.normalize()
                                return vec4(norm, 1)
                        })
                        const res = fs.fragment(ctx())
                        expect(res).toContain('normalize')
                        expect(res).toContain('out.pos')
                })
        })

        describe('Varying Type Consistency', () => {
                it('should maintain type consistency between vertex and fragment shaders', () => {
                        const color = varying(vec3(), 'vertexColor')
                        const vs = Scope(() => {
                                color.assign(vec3(1, 0.5, 0.2))
                                return vec4(position, 1)
                        })
                        const fs = vec4(color, 1)
                        const vertexResult = vs.vertex(ctx())
                        const fragmentResult = fs.fragment(ctx())
                        expect(vertexResult).toContain('vertexColor: vec3f')
                        expect(fragmentResult).toContain('vertexColor: vec3f')
                })

                it('should handle scalar varying types correctly', () => {
                        const vDepth = varying(float(), 'depth')
                        const vs = Scope(() => {
                                vDepth.assign(float(0.5))
                                return vec4(position, 1)
                        })
                        const res = vs.vertex(ctx())
                        expect(res).toContain('depth: f32')
                        expect(res).toContain('out.depth =')
                })

                it('should handle vec4 varying types correctly', () => {
                        const vData = varying(vec4(), 'data')
                        const vs = Scope(() => {
                                vData.assign(vec4(1, 2, 3, 4))
                                return vec4(position, 1)
                        })
                        const res = vs.vertex(ctx())
                        expect(res).toContain('data: vec4f')
                })
        })

        describe('Varying Location Assignment', () => {
                it('should assign location numbers sequentially', () => {
                        const vFirst = varying(vec3(), 'first')
                        const vSecond = varying(vec3(), 'second')
                        const vThird = varying(vec3(), 'third')
                        const vs = Scope(() => {
                                vFirst.assign(vec3(1, 2, 3))
                                vSecond.assign(vec3(4, 5, 6))
                                vThird.assign(vec3(7, 8, 9))
                                return vec4(position, 1)
                        })
                        const res = vs.vertex(ctx())
                        expect(res).toContain('@location(0) first')
                        expect(res).toContain('@location(1) second')
                        expect(res).toContain('@location(2) third')
                })

                it('should start location numbering from 0', () => {
                        const normal = varying(vec3(), 'normal')
                        const vs = Scope(() => {
                                normal.assign(vec3(0, 1, 0))
                                return vec4(position, 1)
                        })
                        const res = vs.vertex(ctx())
                        expect(res).toContain('@location(0) normal')
                })
        })

        describe('Platform-Specific Varying Differences', () => {
                it('should generate different syntax for WebGL vs WebGPU varyings', () => {
                        const uv = varying(vec3(), 'texCoord')
                        const vs = Scope(() => {
                                uv.assign(vec3(0.5, 0.5, 0))
                                return vec4(position, 1)
                        })
                        const wgslResult = vs.vertex(ctx())
                        const glslResult = vs.vertex(ctx(true))
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
                        const wgslResult = fs.fragment(ctx())
                        const glslResult = fs.fragment(ctx(true))
                        expect(wgslResult).toContain('out.texCoord')
                        expect(glslResult).toContain('texCoord')
                })
        })

        describe('Varying Processing Edge Cases', () => {
                it('should handle varying with computed expressions', () => {
                        const computed = varying(vec3(), 'computed')
                        const vs = Scope(() => {
                                const base = vec3(1, 2, 3)
                                computed.assign(base.normalize().mul(float(2.0)))
                                return vec4(position, 1)
                        })
                        const res = vs.vertex(ctx())
                        expect(res).toContain('computed: vec3f')
                        expect(res).toContain('normalize')
                        expect(res).toContain('* 2.0')
                })

                it('should handle varying with function call res', () => {
                        const processed = varying(vec3(), 'processed')
                        const mathFunc = Fn(([x]) => {
                                return x.sin().cos()
                        })
                        const vs = Scope(() => {
                                const input = vec3(1, 2, 3)
                                processed.assign(mathFunc(input))
                                return vec4(position, 1)
                        })
                        const res = vs.vertex(ctx())
                        expect(res).toContain('processed: vec3f')
                        expect(res).toContain('sin')
                        expect(res).toContain('cos')
                })
        })
})
