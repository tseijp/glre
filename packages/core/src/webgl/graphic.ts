import { nested } from 'reev'
import { getStride, GLSL_FS, GLSL_VS, is, loadingTexture } from '../helpers'
import { createBuffer, createProgram, createTexture, updateAttrib, updateBuffer, updateInstance, updateUniform } from './utils'
import type { GL } from '../types'

export const graphic = (gl: GL): Partial<GL> => {
        let { context: c, count, instanceCount, isDepth, textures, uniforms, instances, attributes } = gl
        const config = { isWebGL: true, gl }
        const fs = gl.fs ? (is.str(gl.fs) ? gl.fs : gl.fs.fragment(config)) : GLSL_FS
        const vs = gl.vs ? (is.str(gl.vs) ? gl.vs : gl.vs.vertex(config)) : GLSL_VS
        const pg = createProgram(c, fs, vs, gl)!
        const vao = c.createVertexArray()
        let activeUnit = 0
        const _units = nested(() => activeUnit++)
        const _uniforms = nested((key) => c.getUniformLocation(pg, key))
        const _attributes = nested((key, value: number[], isInstance = false) => {
                const stride = getStride(value.length, isInstance ? instanceCount : count, gl.error, key)
                return { stride, location: c.getAttribLocation(pg, key), ...createBuffer(c, value) }
        })
        return {
                _attribute(key: string, value: number[]) {
                        if (attributes && !(key in attributes)) return
                        c.useProgram((gl.program = pg))
                        c.bindVertexArray(vao)
                        const a = _attributes(key, value)
                        updateBuffer(c, a.array, a.buffer, value as number[])
                        updateAttrib(c, a.location, a.stride, a.buffer)
                },
                _instance(key: string, value: number[]) {
                        if (instances && !(key in instances)) return
                        c.useProgram((gl.program = pg))
                        c.bindVertexArray(vao)
                        const a = _attributes(key, value, true)
                        updateBuffer(c, a.array, a.buffer, value)
                        updateInstance(c, a.location, a.stride, a.buffer)
                },
                _uniform(key: string, value: number | number[]) {
                        if (uniforms && !(key in uniforms)) return
                        c.useProgram((gl.program = pg))
                        updateUniform(c, _uniforms(key), value)
                },
                _texture(key: string, src: string) {
                        if (textures && !(key in textures)) return
                        c.useProgram((gl.program = pg))
                        const location = _uniforms(key)
                        const unit = _units(key)
                        createTexture(c, null, location, unit, false)
                        loadingTexture(src, (source, isVideo) => {
                                c.useProgram((gl.program = pg))
                                const render = createTexture(c, source, location, unit, isVideo)
                                if (render) gl({ render })
                        })
                },
                clean() {
                        c.deleteVertexArray(vao)
                        c.deleteProgram(pg)
                },
                render() {
                        c.useProgram((gl.program = pg))
                        c.bindVertexArray(vao)
                        if (isDepth) c.clear(c.DEPTH_BUFFER_BIT)
                        if (instanceCount > 1) {
                                c.drawArraysInstanced(c.TRIANGLES, 0, count, instanceCount)
                        } else c.drawArrays(c.TRIANGLES, 0, count)
                        c.bindFramebuffer(c.FRAMEBUFFER, null)
                },
        } as Partial<GL>
}

export type WebGLGraphic = ReturnType<typeof graphic>
