import { nested } from 'reev'
import { getStride, GLSL_FS, GLSL_VS, is, loadingTexture } from '../helpers'
import { createBuffer, createProgram, createTexture, updateAttrib, updateBuffer, updateInstance, updateUniform } from './utils'
import type { GL } from '../types'

export const graphic = (gl: GL, index = 0): Partial<GL> => {
        let { context: c, count, instanceCount, textures, uniforms, instances, attributes } = gl
        const config = { isWebGL: true, gl }
        const fs = gl.fs ? (is.str(gl.fs) ? gl.fs : gl.fs.fragment(config)) : GLSL_FS
        const vs = gl.vs ? (is.str(gl.vs) ? gl.vs : gl.vs.vertex(config)) : GLSL_VS
        const pg = (gl.program = createProgram(c, fs, vs, gl)!)
        const vao = (gl.vao = c.createVertexArray())
        let activeUnit = 0
        const _units = nested(() => activeUnit++)
        const _uniforms = nested((key) => c.getUniformLocation(pg, key))
        const _attributes = nested((key, value: number[], isInstance = false) => {
                const stride = getStride(value.length, isInstance ? instanceCount : count, gl.error, key)
                return { stride, location: c.getAttribLocation(pg, key), ...createBuffer(c, value) }
        })
        return {
                _attribute(key, value) {
                        if (attributes && !(key in attributes)) return
                        c.useProgram(pg)
                        c.bindVertexArray(vao)
                        const a = _attributes(key, value)
                        updateBuffer(c, a.array, a.buffer, value as number[])
                        updateAttrib(c, a.location, a.stride, a.buffer)
                },
                _instance(key, value) {
                        if (instances && !(key in instances)) return
                        c.useProgram(pg)
                        c.bindVertexArray(vao)
                        const a = _attributes(key, value, true)
                        updateBuffer(c, a.array, a.buffer, value as number[])
                        updateInstance(c, a.location, a.stride, a.buffer)
                },
                _uniform(key, value) {
                        if (uniforms && !(key in uniforms)) return
                        c.useProgram(pg)
                        updateUniform(c, _uniforms(key), value as number[])
                },
                _texture(key: string, src: string) {
                        if (textures && !(key in textures)) return
                        c.useProgram(pg)
                        const loc = _uniforms(key)
                        const unit = _units(key)
                        createTexture(c, null, loc, unit, false)
                        loadingTexture(src, (source, isVideo) => {
                                c.useProgram(pg)
                                const render = createTexture(c, source, loc, unit, isVideo)
                                if (render) gl({ render })
                        })
                },
                clean() {
                        c.deleteVertexArray(vao)
                        c.deleteProgram(pg)
                },
                render() {
                        c.useProgram(pg)
                        c.bindVertexArray(vao)
                        if (instanceCount > 1) {
                                c.drawArraysInstanced(c.TRIANGLES, 0, count, instanceCount)
                        } else c.drawArrays(c.TRIANGLES, 0, count)
                        c.bindFramebuffer(c.FRAMEBUFFER, null)
                },
                setCount(next, at = index) {
                        if (at === index) count = next
                },
                setTriangleCount(next, at = index) {
                        if (at === index) count = next * 3
                },
                setInstanceCount(next, at = index) {
                        if (at === index) instanceCount = next
                },
        } as Partial<GL>
}

export type WebGLGraphic = ReturnType<typeof graphic>
