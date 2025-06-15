import { nested as cached } from 'reev'
import { is } from './utils/helpers'
import { createAttrib, createIbo, createProgram, createTexture, createVbo, getStride } from './utils/program'
import type { GL, WebGLState } from './types'

export const webgl = async (gl: Partial<GL>) => {
        const c = gl.el!.getContext('webgl2')!
        const pg = createProgram(c, gl.vs, gl.fs)
        const state = { context: c, program: pg } as WebGLState
        c.useProgram(pg)

        let _activeUnit = 0
        const activeUnits = cached(() => _activeUnit++)

        const uniformLocations = cached((key) => c.getUniformLocation(pg, key))
        const attribLocations = cached((key) => c.getAttribLocation(pg, key))

        const clean = () => c.deleteProgram(pg)

        const render = () => {
                c.clear(c.COLOR_BUFFER_BIT)
                c.viewport(0, 0, ...gl.size!)
                c.drawArrays(c.TRIANGLES, 0, 3)
        }

        const _attribute = (key = '', value: number[], iboValue: number[]) => {
                const loc = attribLocations(key, true)
                const vbo = createVbo(c, value)
                const ibo = createIbo(c, iboValue)
                const str = getStride(gl.count!, value, iboValue)
                createAttrib(c, str, loc, vbo, ibo)
        }

        const _uniform = (key: string, value: number | number[]) => {
                const loc = uniformLocations(key)
                if (is.num(value)) return c.uniform1f(loc, value)
                let l = value.length
                if (l <= 4) return c[`uniform${l as 2}fv`](loc, value)
                l = Math.sqrt(l) << 0
                c[`uniformMatrix${l as 2}fv`](loc, false, value)
        }

        const _texture = (alt: string, src: string) => {
                const image = new Image()
                Object.assign(image, { src, alt, crossOrigin: 'anonymous' })
                image.decode().then(() => {
                        const loc = uniformLocations(image.alt)
                        const unit = activeUnits(image.alt)
                        createTexture(c, image, loc, unit)
                })
        }

        return { webgl: state, render, clean, _attribute, _uniform, _texture }
}
