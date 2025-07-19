import { nested as cached } from 'reev'
import { fragment, vertex, compute } from './node'
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

const vert = /* cpp */ `
#version 300 es
void main() {
        float x = float(gl_VertexID % 2) * 4.0 - 1.0;
        float y = float(gl_VertexID / 2) * 4.0 - 1.0;
        gl_Position = vec4(x, y, 0.0, 1.0);
}`.trim()

export const webgl = async (gl: GL) => {
        const c = gl.el!.getContext('webgl2')!
        c.getExtension('EXT_color_buffer_float')
        const pg = createProgram(c, gl.vs, gl.fs, gl)!
        const pg2 = createProgram(c, vert, gl.cs, gl)!
        c.useProgram(pg)

        let activeUnit = 0 // for texture units
        let currentNum = 0 // for storage buffers

        const uniforms = cached((key) => c.getUniformLocation(pg, key))
        const attribs = cached((key) => c.getAttribLocation(pg, key))
        const storages = cached(() => {
                const unit = activeUnit++
                const a = { texture: c.createTexture(), buffer: c.createFramebuffer() }
                const b = { texture: c.createTexture(), buffer: c.createFramebuffer() }
                return { a, b, unit, width: 0, height: 0 }
        })

        const _attribute = (key = '', value: number[], iboValue: number[]) => {
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
                        const unit = activeUnit++
                        createTexture(c, image, loc, unit)
                        gl.loading--
                })
        }

        const _storage = (key: string, value: number[] | Float32Array) => {
                const array = value instanceof Float32Array ? value : new Float32Array(value)
                const storage = storages(key)
                const size = Math.ceil(Math.sqrt(array.length))
                storage.width = size
                storage.height = size
                createStorage(c, size, storage, array)
                c.uniform1i(uniforms(key), storage.unit)
        }

        const clean = () => {
                c.deleteProgram(pg)
                if (pg2) c.deleteProgram(pg2)
                for (const { a, b } of storages.map.values()) {
                        c.deleteTexture(a.texture)
                        c.deleteTexture(b.texture)
                        c.deleteFramebuffer(a.buffer)
                        c.deleteFramebuffer(b.buffer)
                }
                c.getExtension('WEBGL_lose_context')?.loseContext()
                gl.el.width = 1
                gl.el.height = 1
        }

        const _compute = () => {
                if (!pg2) return
                c.useProgram(pg2)
                for (const [, storage] of storages.map) {
                        const output = currentNum % 2 ? storage.b : storage.a
                        c.bindFramebuffer(c.FRAMEBUFFER, output.buffer)
                        c.framebufferTexture2D(c.FRAMEBUFFER, c.COLOR_ATTACHMENT0, c.TEXTURE_2D, output.texture, 0)
                        const iTimeLoc = c.getUniformLocation(pg2, 'iTime') // @TODO REMOVE
                        c.uniform1f(iTimeLoc, performance.now() / 1000) // @TODO REMOVE
                        c.viewport(0, 0, storage.width, storage.height)
                        c.drawArrays(c.TRIANGLES, 0, 6)
                        c.bindFramebuffer(c.FRAMEBUFFER, null)
                }
                currentNum++
                c.useProgram(pg)
        }

        const render = () => {
                _compute()
                c.bindFramebuffer(c.FRAMEBUFFER, null)
                c.clear(c.COLOR_BUFFER_BIT)
                c.viewport(0, 0, ...gl.size)
                for (const [key, { unit, a, b }] of storages.map) {
                        const loc = uniforms(key)
                        const output = currentNum % 2 ? a : b
                        c.activeTexture(c.TEXTURE0 + unit)
                        c.bindTexture(c.TEXTURE_2D, output.texture)
                        c.uniform1i(loc, unit)
                }
                c.drawArrays(c.TRIANGLES, 0, gl.count)
        }

        const webgl: WebGLState = { context: c, program: pg }

        return { webgl, render, clean, _attribute, _uniform, _texture, _storage }
}
