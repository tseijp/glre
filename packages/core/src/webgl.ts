import { nested as cached } from 'reev'
import { is } from './utils/helpers'
import { activeTexture, createAttrib, createIbo, createProgram, createTexture, createVbo } from './utils/program'
import type { GL, WebGLState } from './types'

export const webgl = async (gl: Partial<GL>) => {
        const c = gl.el!.getContext('webgl2')!
        const pg = createProgram(c, gl.vs, gl.fs)
        const state = { context: c, program: pg } as WebGLState

        let _activeUnit = 0
        const activeUnits = cached(() => _activeUnit++)

        const uniformLocations = cached((key) => c.getUniformLocation(pg, key))
        const attribLocations = cached((key) => c.getAttribLocation(pg, key))

        const strides = cached((_, count: number, value: number[], iboValue?: number[]) => {
                if (iboValue) count = Math.max(...iboValue) + 1
                const stride = value.length / count
                if (stride !== Math.floor(stride)) console.warn(`Vertex Stride Error: count ${count} is mismatch`)
                return Math.floor(stride)
        })

        const uniforms = cached((key, value: number | number[]) => {
                const loc = uniformLocations(key)
                if (is.num(value)) return (value: any) => c.uniform1f(loc, value)
                let l = value.length as 3
                if (l <= 4) return (value: any) => c[`uniform${l}fv`](loc, value)
                l = (Math.sqrt(l) << 0) as 3
                return (value: any) => c[`uniformMatrix${l}fv`](loc, false, value)
        })

        const clean = () => c.deleteProgram(pg)

        const render = () => {
                c.useProgram(pg)
                c.clear(c.COLOR_BUFFER_BIT)
                c.viewport(0, 0, ...gl.size!)
                c.drawArrays(c.TRIANGLES, 0, 3)
        }

        const _attribute = (key = '', value: number[], iboValue: number[]) => {
                const loc = attribLocations(key, true)
                const vbo = createVbo(c, value)
                const ibo = createIbo(c, iboValue)
                const str = strides(key, gl.count, value, iboValue)
                createAttrib(c, str, loc, vbo, ibo)
        }

        const _uniform = (key: string, value: number | number[]) => {
                uniforms(key, value)(value)
        }

        const _texture = (alt: string, src: string) => {
                const image = new Image()
                Object.assign(image, { src, alt, crossOrigin: 'anonymous' })
                image.decode().then(() => {
                        const loc = uniformLocations(image.alt)
                        const unit = activeUnits(image.alt)
                        const tex = createTexture(c, image)
                        activeTexture(c, loc, unit, tex)
                })
        }

        return { webgl: state, render, clean, _attribute, _uniform, _texture }
}
