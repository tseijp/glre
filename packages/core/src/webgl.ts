import { nested as cached } from 'reev'
import { loadingImage } from './utils/helpers'
import { createAttrib, createProgram, createStorage, createTexture, createUniform } from './utils/program'
import { compute, fragment, vertex } from './node'
import type { GL, WebGLState } from './types'

const vert = /* cpp */ `
#version 300 es
void main() {
        float x = float(gl_VertexID % 2) * 4.0 - 1.0;
        float y = float(gl_VertexID / 2) * 4.0 - 1.0;
        gl_Position = vec4(x, y, 0.0, 1.0);
}`.trim()

const computeProgram = (gl: GL, c: WebGL2RenderingContext) => {
        const config = { isWebGL: true, gl }
        const pg = createProgram(c, vert, compute(gl.cs, config), gl)!
        if (!pg) return null

        gl.uniform({ iParticles: gl.particles }) // set arrayLength uniform
        c.getExtension('EXT_color_buffer_float')

        let activeUnit = 0 // for texture units
        let currentNum = 0 // for storage buffers

        const uniforms = cached((key) => c.getUniformLocation(pg, key))
        const storages = cached(() => {
                const unit = activeUnit++
                const size = Math.ceil(Math.sqrt(gl.particles))
                const array = new Float32Array(size * size * 4) // RGBA texture data
                const a = { texture: c.createTexture(), buffer: c.createFramebuffer() }
                const b = { texture: c.createTexture(), buffer: c.createFramebuffer() }
                return { a, b, unit, size, array, particles: gl.particles }
        })

        const _uniform = (key: string, value: number | number[]) => {
                c.useProgram(pg)
                createUniform(c, uniforms(key)!, value)
        }

        const _storage = (key: string, value: number[] | Float32Array) => {
                const storage = storages(key)
                createStorage(c, value, storage)
                c.useProgram(pg)
                c.uniform1i(uniforms(key), storage.unit)
        }

        const clean = () => {
                if (pg) c.deleteProgram(pg)
                for (const { a, b } of storages.map.values()) {
                        c.deleteTexture(a.texture)
                        c.deleteTexture(b.texture)
                        c.deleteFramebuffer(a.buffer)
                        c.deleteFramebuffer(b.buffer)
                }
        }

        const render = () => {
                c.useProgram(pg)
                const storageArray = Array.from(storages.map.values())
                if (storageArray.length === 0) return
                for (const [key, { unit, a, b }] of storages.map) {
                        const input = currentNum % 2 ? a : b
                        const loc = uniforms(key)
                        c.activeTexture(c.TEXTURE0 + unit)
                        c.bindTexture(c.TEXTURE_2D, input.texture)
                        c.uniform1i(loc, unit)
                }
                const outputs = storageArray.map((storage) => (currentNum % 2 ? storage.b : storage.a))
                c.bindFramebuffer(c.FRAMEBUFFER, outputs[0].buffer)
                const colorAttachments = outputs.map((_, i) => c.COLOR_ATTACHMENT0 + i)
                outputs.forEach(({ texture }, i) => {
                        c.framebufferTexture2D(c.FRAMEBUFFER, colorAttachments[i], c.TEXTURE_2D, texture, 0)
                })
                c.drawBuffers(colorAttachments)
                c.drawArrays(c.TRIANGLES, 0, 6)
                c.bindFramebuffer(c.FRAMEBUFFER, null)
                currentNum++
        }

        return { render, clean, _uniform, _storage, storages }
}

export const webgl = async (gl: GL) => {
        const config = { isWebGL: true, gl }
        const c = gl.el!.getContext('webgl2')!
        const cp = computeProgram(gl, c)
        const pg = createProgram(c, vertex(gl.vs, config), fragment(gl.fs, config), gl)!
        c.useProgram(pg)

        let activeUnit = 0 // for texture units

        const attribs = cached((key) => c.getAttribLocation(pg, key))
        const uniforms = cached((key) => c.getUniformLocation(pg, key))
        const textures = cached(() => activeUnit++)

        const _attribute = (key = '', value: number[], iboValue: number[]) => {
                const loc = attribs(key, true)
                createAttrib(c, loc, gl.count, value, iboValue)
        }

        const _uniform = (key: string, value: number | number[]) => {
                c.useProgram(pg)
                createUniform(c, uniforms(key)!, value)
                if (cp) cp._uniform(key, value)
        }

        const _texture = (key: string, src: string) => {
                c.useProgram(pg)
                loadingImage(gl, src, (source) => {
                        const loc = uniforms(key)
                        const unit = textures(key)
                        createTexture(c, source, loc, unit)
                })
        }

        const clean = () => {
                if (cp) cp.clean()
                c.deleteProgram(pg)
                c.getExtension('WEBGL_lose_context')?.loseContext()
        }

        const render = () => {
                if (cp) cp.render()
                c.useProgram(pg)
                c.bindFramebuffer(c.FRAMEBUFFER, null)
                c.clear(c.COLOR_BUFFER_BIT)
                c.viewport(0, 0, ...gl.size)
                c.drawArrays(c.TRIANGLES, 0, gl.count)
        }

        const webgl: WebGLState = { context: c, program: pg, storages: cp?.storages }

        return { webgl, render, clean, _attribute, _uniform, _texture, _storage: cp?._storage }
}
