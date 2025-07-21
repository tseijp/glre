import { nested as cached } from 'reev'
import { loadingImage } from './utils/helpers'
import { createAttrib, createProgram, createStorage, createTexture, createUniform } from './utils/program'
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
        const pg1 = createProgram(c, gl.vs, gl.fs, gl)!
        const pg2 = createProgram(c, vert, gl.cs, gl)!
        c.useProgram(pg1)

        let activeUnit = 0 // for texture units
        let currentNum = 0 // for storage buffers

        const attribs = cached((key) => c.getAttribLocation(pg1, key))
        const uniforms1 = cached((key) => c.getUniformLocation(pg1, key))
        const uniforms2 = cached((key) => c.getUniformLocation(pg2, key))
        const textures = cached(() => activeUnit++)
        const storages = cached(() => {
                const unit = activeUnit++
                const a = { texture: c.createTexture(), buffer: c.createFramebuffer() }
                const b = { texture: c.createTexture(), buffer: c.createFramebuffer() }
                return { a, b, unit, width: 0, height: 0 }
        })

        const _attribute = (key = '', value: number[], iboValue: number[]) => {
                const loc = attribs(key, true)
                createAttrib(c, loc, gl.count, value, iboValue)
        }

        const _uniform = (key: string, value: number | number[]) => {
                createUniform(c, uniforms1(key)!, value)
                if (!pg2) return
                c.useProgram(pg2)
                createUniform(c, uniforms2(key)!, value)
                c.useProgram(pg1)
        }

        const _texture = (key: string, src: string) => {
                loadingImage(gl, src, (source) => {
                        const loc = uniforms1(key)
                        const unit = textures(key)
                        createTexture(c, source, loc, unit)
                })
        }

        const _storage = (key: string, value: number[] | Float32Array) => {
                const array = value instanceof Float32Array ? value : new Float32Array(value)
                const storage = storages(key)
                const size = Math.ceil(Math.sqrt(array.length / 2))
                storage.width = size
                storage.height = size
                createStorage(c, size, storage, array)
                c.uniform1i(uniforms1(key), storage.unit)
        }

        const clean = () => {
                c.deleteProgram(pg1)
                if (pg2) c.deleteProgram(pg2)
                for (const { a, b } of storages.map.values()) {
                        c.deleteTexture(a.texture)
                        c.deleteTexture(b.texture)
                        c.deleteFramebuffer(a.buffer)
                        c.deleteFramebuffer(b.buffer)
                }
                c.getExtension('WEBGL_lose_context')?.loseContext()
        }

        const _compute = () => {
                c.useProgram(pg2)
                const storageArray = Array.from(storages.map.values())
                if (storageArray.length === 0) return
                for (const [key, { unit, a, b }] of storages.map) {
                        // const input = currentNum % 2 ? a : b
                        // c.activeTexture(c.TEXTURE0 + unit)
                        // c.bindTexture(c.TEXTURE_2D, input.texture)
                        const loc = uniforms2(key)
                        c.uniform1i(loc, unit)
                }
                const outputs = storageArray.map((storage) => (currentNum % 2 ? storage.b : storage.a))
                c.bindFramebuffer(c.FRAMEBUFFER, outputs[0].buffer)
                outputs.forEach((output, i) => {
                        c.framebufferTexture2D(c.FRAMEBUFFER, c.COLOR_ATTACHMENT0 + i, c.TEXTURE_2D, output.texture, 0)
                })
                // c.drawBuffers(colorAttachments)
                // c.viewport(0, 0, storageArray[0].width, storageArray[0].height)
                c.drawArrays(c.TRIANGLES, 0, 6)
                // c.bindFramebuffer(c.FRAMEBUFFER, null)
                currentNum++
                c.useProgram(pg1)
        }

        const render = () => {
                if (pg2) _compute()
                c.bindFramebuffer(c.FRAMEBUFFER, null)
                c.clear(c.COLOR_BUFFER_BIT)
                c.viewport(0, 0, ...gl.size)
                for (const [key, { unit, a, b }] of storages.map) {
                        const loc = uniforms1(key)
                        const output = currentNum % 2 ? a : b
                        c.activeTexture(c.TEXTURE0 + unit)
                        c.bindTexture(c.TEXTURE_2D, output.texture)
                        c.uniform1i(loc, unit)
                }
                c.drawArrays(c.TRIANGLES, 0, gl.count)
        }

        const webgl: WebGLState = { context: c, program: pg1 }

        return { webgl, render, clean, _attribute, _uniform, _texture, _storage }
}
