import { nested } from 'reev'
import { getStride, GLSL_FS, GLSL_VS, is, loadingTexture } from '../helpers'
import { createArrayBuffer, createProgram, createTexture, setArrayBuffer, updateAttrib, updateInstance, updateUniform } from './utils'
import type { GL } from '../types'

export const graphic = (gl: GL) => {
        const config = { isWebGL: true, gl }
        const c = gl.context
        const fs = gl.fs ? (is.str(gl.fs) ? gl.fs : gl.fs.fragment(config)) : GLSL_FS
        const vs = gl.vs ? (is.str(gl.vs) ? gl.vs : gl.vs.vertex(config)) : GLSL_VS
        const pg = createProgram(c, fs, vs, gl)!
        let activeUnit = 0

        const units = nested(() => activeUnit++)
        const uniforms = nested((key) => c.getUniformLocation(pg, key))
        const attributes = nested((key, value: number[], isInstance = false) => {
                const stride = getStride(value.length, isInstance ? gl.instanceCount : gl.triangleCount, gl.error)
                const location = c.getAttribLocation(pg, key)
                const { array, buffer } = createArrayBuffer(c, value)
                return { array, buffer, location, stride }
        })

        gl('_attribute', (key = '', value: number[]) => {
                c.useProgram((gl.program = pg))
                const { array, buffer, location, stride } = attributes(key, value)
                if (location < 0) return // ??
                setArrayBuffer(c, array, buffer, value)
                updateAttrib(c, location, stride, buffer)
        })

        gl('_instance', (key: string, value: number[]) => {
                c.useProgram((gl.program = pg))
                const { array, buffer, location, stride } = attributes(key, value, true)
                if (location < 0) return // ??
                setArrayBuffer(c, array, buffer, value)
                updateInstance(c, location, stride, buffer)
        })

        gl('_uniform', (key: string, value: number | number[]) => {
                c.useProgram((gl.program = pg))
                const loc = uniforms(key)
                if (!loc) return // ??
                updateUniform(c, loc, value)
        })

        gl('_texture', (key: string, src: string) => {
                gl.loading++
                loadingTexture(src, (source, isVideo) => {
                        c.useProgram((gl.program = pg))
                        const loc = uniforms(key)
                        if (!loc) return gl.loading-- // ??
                        const unit = units(key)
                        const fun = createTexture(c, source, loc, unit, isVideo)
                        if (fun) gl({ render: fun })
                        gl.loading--
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
