import { nested as cached } from 'reev'
import { fragment, vertex } from './node'
import { is } from './utils/helpers'
import {
        createAttrib,
        createIbo,
        createProgram,
        createStorage,
        createTexture,
        createVbo,
        getStride,
} from './utils/program'
import type { GL, WebGLState } from './types'

export const webgl = async (gl: GL) => {
        const c = gl.el!.getContext('webgl2')!
        const config = { isWebGL: true, gl }
        const fs = fragment(gl.fs, config)
        const vs = vertex(gl.vs, config)
        const pg = createProgram(c, vs, fs, gl.error)!
        c.useProgram(pg)

        let activeUnit = 0
        const uniforms = cached((key) => c.getUniformLocation(pg, key))
        const attribs = cached((key) => c.getAttribLocation(pg, key))
        const units = cached(() => activeUnit++)
        const storages = cached(() => ({
                texture: c.createTexture(),
                framebuffer: c.createFramebuffer(),
                unit: activeUnit++,
        }))

        const _attribute = (key = '', value: number[], iboValue: number[]) => {
                if (gl.count === 3 && value.length === 0) {
                        return
                }
                const loc = attribs(key, true)
                const vbo = createVbo(c, value)
                const ibo = createIbo(c, iboValue)
                const str = getStride(gl.count, value, iboValue)
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
                gl.loading++
                const image = new Image()
                Object.assign(image, { src, crossOrigin: 'anonymous' })
                image.decode().then(() => {
                        const loc = uniforms(key)
                        const unit = units(key)
                        createTexture(c, image, loc, unit)
                        gl.loading--
                })
        }

        const _storage = (key: string, value: number[] | Float32Array) => {
                const { texture, unit } = storages(key)
                createStorage(c, value, unit, uniforms(key), texture)
        }

        const clean = () => {
                c.deleteProgram(pg)
                c.getExtension('WEBGL_lose_context')?.loseContext()
                gl.el.width = 1
                gl.el.height = 1
        }

        const render = () => {
                c.clear(c.COLOR_BUFFER_BIT)
                c.viewport(0, 0, ...gl.size)
                if (gl.count === 3) {
                        c.drawArrays(c.TRIANGLES, 0, 3)
                } else {
                        c.drawArrays(c.TRIANGLES, 0, 6)
                }
        }

        const webgl: WebGLState = { context: c, program: pg }

        return { webgl, render, clean, _attribute, _uniform, _texture, _storage }
}
