import { nested } from 'reev'
import { getStride, GLSL_FS, GLSL_VS, is, loadingTexture } from '../helpers'
import { createBuffer, createProgram, createTexture, updateAttrib, updateBuffer, updateInstance, updateUniform } from './utils'
import type { GL } from '../types'

export const graphic = (gl: GL) => {
        const config = { isWebGL: true, gl }
        const c = gl.gl
        const fs = gl.fs ? (is.str(gl.fs) ? gl.fs : gl.fs.fragment(config)) : GLSL_FS
        const vs = gl.vs ? (is.str(gl.vs) ? gl.vs : gl.vs.vertex(config)) : GLSL_VS
        const pg = createProgram(c, fs, vs, gl)!
        let activeUnit = 0

        const units = nested(() => activeUnit++)
        const uniforms = nested((key) => c.getUniformLocation(pg, key))
        const attributes = nested((key, value: number[], isInstance = false) => {
                const stride = getStride(value.length, isInstance ? gl.instanceCount : gl.triangleCount, gl.error)
                return { stride, location: c.getAttribLocation(pg, key), ...createBuffer(c, value) }
        })

        gl('_attribute', (key: string, value: number[]) => {
                c.useProgram((gl.program = pg))
                const a = attributes(key, value)
                updateBuffer(c, a.array, a.buffer, value)
                updateAttrib(c, a.location, a.stride, a.buffer)
        })

        gl('_instance', (key: string, value: number[]) => {
                c.useProgram((gl.program = pg))
                const a = attributes(key, value, true)
                updateBuffer(c, a.array, a.buffer, value)
                updateInstance(c, a.location, a.stride, a.buffer)
        })

        gl('_uniform', (key: string, value: number | number[]) => {
                c.useProgram((gl.program = pg))
                updateUniform(c, uniforms(key), value)
        })

        gl('_texture', (key: string, src: string) => {
                c.useProgram((gl.program = pg))
                const location = uniforms(key)
                const unit = units(key)
                createTexture(c, null, location, unit, false)
                loadingTexture(src, (source, isVideo) => {
                        c.useProgram((gl.program = pg))
                        const render = createTexture(c, source, location, unit, isVideo)
                        if (render) gl({ render })
                })
        })

        gl('clean', () => {
                c.deleteProgram(pg)
        })

        gl('render', () => {
                c.useProgram((gl.program = pg))
                if (gl.instanceCount > 1) {
                        c.drawArraysInstanced(c.TRIANGLES, 0, gl.triangleCount, gl.instanceCount)
                } else c.drawArrays(c.TRIANGLES, 0, gl.triangleCount)
                c.bindFramebuffer(c.FRAMEBUFFER, null)
        })
}

export type WebGLGraphic = ReturnType<typeof graphic>
