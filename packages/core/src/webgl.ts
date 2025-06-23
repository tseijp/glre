import { nested as cached } from 'reev'
import { is } from './utils/helpers'
import { createAttrib, createIbo, createProgram, createTexture, createVbo, getStride } from './utils/program'
import type { GL, WebGLState } from './types'

export const webgl = async (gl: Partial<GL>) => {
        const c = gl.el!.getContext('webgl2')!
        const pg = createProgram(c, gl.vs, gl.fs, () => void (gl.isLoop = false))!
        const state = { context: c, program: pg } as WebGLState
        c.useProgram(pg)

        let _activeUnit = 0
        const uniforms = cached((key) => c.getUniformLocation(pg, key))
        const attribs = cached((key) => c.getAttribLocation(pg, key))
        const units = cached(() => _activeUnit++)

        const clean = () => c.deleteProgram(pg)

        const render = () => {
                c.clear(c.COLOR_BUFFER_BIT)
                c.viewport(0, 0, ...gl.size!)
                c.drawArrays(c.TRIANGLES, 0, 3)
        }

        const _attribute = (key = '', value: number[], iboValue: number[]) => {
                const loc = attribs(key, true)
                const vbo = createVbo(c, value)
                const ibo = createIbo(c, iboValue)
                const str = getStride(gl.count!, value, iboValue)
                createAttrib(c, str, loc, vbo, ibo)
        }

        const _uniform = (key: string, value: number | number[]) => {
                const loc = uniforms(key)
                if (is.num(value)) return c.uniform1f(loc, value)
                let l = value.length
                if (l <= 4) return c[`uniform${l as 2}fv`](loc, value)
                l = Math.sqrt(l) << 0
                c[`uniformMatrix${l as 2}fv`](loc, false, value)
        }

        const _texture = (key: string, src: string) => {
                const image = new Image()
                Object.assign(image, { src, crossOrigin: 'anonymous' })
                image.decode().then(() => {
                        const loc = uniforms(key)
                        const unit = units(key)
                        createTexture(c, image, loc, unit)
                })
        }

        return { webgl: state, render, clean, _attribute, _uniform, _texture }
}
