import { nested as cached } from 'reev'
import { getStride, GLSL_FS, GLSL_VS, is, loadingTexture } from '../helpers'
import { createArrayBuffer, createProgram, createTexture, setArrayBuffer, updateAttrib, updateInstance, updateUniform } from './utils'
import type { GL } from '../types'

export const graphic = (gl: GL, c: WebGL2RenderingContext, props: Partial<GL>) => {
        const config = { isWebGL: true, gl }
        const fs = props.fs ? (is.str(props.fs) ? props.fs : props.fs.fragment(config)) : GLSL_FS
        const vs = props.vs ? (is.str(props.vs) ? props.vs : props.vs.vertex(config)) : GLSL_VS
        const pg = createProgram(c, fs, vs, gl)!
        c.useProgram(pg)
        let activeUnit = 0
        const units = cached(() => activeUnit++)
        const uniforms = cached((key) => c.getUniformLocation(pg, key))
        const attribs = cached((key, value: number[], isInstance = false) => {
                const stride = getStride(value.length, isInstance ? gl.instanceCount : gl.count, gl.error)
                const location = c.getAttribLocation(pg, key)
                const { array, buffer } = createArrayBuffer(c, value)
                return { array, buffer, location, stride }
        })

        const _attribute = (key = '', value: number[]) => {
                const { array, buffer, location, stride } = attribs(key, value)
                if (location < 0) return
                setArrayBuffer(c, array, buffer, value)
                updateAttrib(c, location, stride, buffer)
        }

        const _instance = (key: string, value: number[]) => {
                const { array, buffer, location, stride } = attribs(key, value, true)
                if (location < 0) return
                setArrayBuffer(c, array, buffer, value)
                updateInstance(c, location, stride, buffer)
        }

        const _uniform = (key: string, value: number | number[]) => {
                const loc = uniforms(key)
                if (!loc) return
                c.useProgram(pg)
                updateUniform(c, loc, value)
        }

        const _texture = (key: string, src: string) => {
                gl.loading++
                c.useProgram(pg)
                loadingTexture(src, (source, isVideo) => {
                        const loc = uniforms(key)
                        if (!loc) return gl.loading--
                        const unit = units(key)
                        const fun = createTexture(c, source, loc, unit, isVideo)
                        if (fun) gl({ render: fun })
                        gl.loading--
                })
        }

        const clean = () => {
                c.deleteProgram(pg)
        }

        const render = () => {
                c.useProgram(pg)
                if (gl.instanceCount > 1) {
                        c.drawArraysInstanced(c.TRIANGLES, 0, gl.count, gl.instanceCount)
                } else c.drawArrays(c.TRIANGLES, 0, gl.count)
        }

        return { render, clean, _attribute, _instance, _uniform, _texture, pg, uniforms, attribs }
}
