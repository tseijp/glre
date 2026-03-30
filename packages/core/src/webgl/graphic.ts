import { nested } from 'reev'
import { getStride, GLSL_FS, GLSL_VS, is, loadingTexture } from '../helpers'
import { createBuffer, createProgram, createTexture, updateAttrib, updateBuffer, updateInstance, updateTexture, updateUniform } from './utils'
import type { GL } from '../types'

export const graphic = (gl: GL, index = 0): Partial<GL> => {
        let { context: c, count, instanceCount: _count, textures, uniforms, instances, attributes } = gl
        const config = { isWebGL: true, gl }
        const fs = gl.fs ? (is.str(gl.fs) ? gl.fs : gl.fs.fragment(config)) : GLSL_FS
        const vs = gl.vs ? (is.str(gl.vs) ? gl.vs : gl.vs.vertex(config)) : GLSL_VS
        const pg = (gl.program = createProgram(c, fs, vs, gl)!)
        const vao = (gl.vao = c.createVertexArray())
        let activeUnit = 0
        const _units = nested(() => activeUnit++)
        const _uniforms = nested((key) => c.getUniformLocation(pg, key))
        const _textures = nested((key, at, config) => {
                return createTexture(c, _uniforms(key), _units(key), at, config)
        })
        const _attributes = nested((key, value: number[], isInstance = false) => {
                const stride = getStride(value.length, isInstance ? _count : count, gl.error, key)
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
                _uniform(key, value, at) {
                        if (uniforms && !(key in uniforms)) return
                        c.useProgram(pg)
                        if (at !== undefined) key = `${key}[${at}]`
                        updateUniform(c, _uniforms(key), value as number[])
                },
                _texture(key, src, at, config) {
                        if (textures && !(key in textures)) return
                        c.useProgram(pg)
                        loadingTexture(src as string, (source, isVideo) => {
                                c.useProgram(pg)
                                const t = _textures(key, at, config)
                                const render = () => updateTexture(c, t.texture, t.unit, source, at)
                                render()
                                if (isVideo) gl({ render })
                        })
                },
                clean() {
                        c.deleteVertexArray(vao)
                        c.deleteProgram(pg)
                },
                render() {
                        c.useProgram(pg)
                        c.bindVertexArray(vao)
                        if (_count > 1) {
                                c.drawArraysInstanced(c.TRIANGLES, 0, count, _count)
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
                        if (at === index) _count = next
                },
        } as Partial<GL>
}

export type WebGLGraphic = ReturnType<typeof graphic>
