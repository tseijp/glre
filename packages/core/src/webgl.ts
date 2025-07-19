import { nested as cached } from 'reev'
import { fragment, vertex, compute } from './node'
import { is } from './utils/helpers'
import { createAttrib, createIbo, createProgram, createTexture, createVbo, getStride } from './utils/program'
import type { GL, WebGLState } from './types'

export const webgl = async (gl: GL) => {
        const c = gl.el!.getContext('webgl2')!
        const floatExt = c.getExtension('EXT_color_buffer_float')
        const config = { isWebGL: true, gl }
        const fs = fragment(gl.fs, config)
        const vs = vertex(gl.vs, config)
        const pg = createProgram(c, vs, fs, gl.error)!
        c.useProgram(pg)

        let activeUnit = 0
        const uniforms = cached((key) => c.getUniformLocation(pg, key))
        const attribs = cached((key) => c.getAttribLocation(pg, key))
        const units = cached(() => activeUnit++)
        const storages = cached((key) => {
                const textureA = c.createTexture()
                const textureB = c.createTexture()
                const framebufferA = c.createFramebuffer()
                const framebufferB = c.createFramebuffer()
                const unit = activeUnit++
                return { textureA, textureB, framebufferA, framebufferB, unit, width: 0, height: 0, current: 0 }
        })

        let computeProgram: WebGLProgram | null = null
        let computeVao: WebGLVertexArrayObject | null = null
        let computeBuffer: WebGLBuffer | null = null

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
                        const unit = units(key)
                        createTexture(c, image, loc, unit)
                        gl.loading--
                })
        }

        const _storage = (key: string, value: number[] | Float32Array) => {
                const array = value instanceof Float32Array ? value : new Float32Array(value)
                const storage = storages(key)
                const size = Math.ceil(Math.sqrt(array.length))
                const data = new Float32Array(size * size * 4)
                for (let i = 0; i < array.length; i++) {
                        data[i * 4] = array[i]
                }
                storage.width = size
                storage.height = size
                c.activeTexture(c.TEXTURE0 + storage.unit)
                c.bindTexture(c.TEXTURE_2D, storage.textureA)
                c.texImage2D(c.TEXTURE_2D, 0, c.RGBA32F, size, size, 0, c.RGBA, c.FLOAT, data)
                c.texParameteri(c.TEXTURE_2D, c.TEXTURE_MIN_FILTER, c.NEAREST)
                c.texParameteri(c.TEXTURE_2D, c.TEXTURE_MAG_FILTER, c.NEAREST)
                c.texParameteri(c.TEXTURE_2D, c.TEXTURE_WRAP_S, c.CLAMP_TO_EDGE)
                c.texParameteri(c.TEXTURE_2D, c.TEXTURE_WRAP_T, c.CLAMP_TO_EDGE)
                c.bindTexture(c.TEXTURE_2D, storage.textureB)
                c.texImage2D(c.TEXTURE_2D, 0, c.RGBA32F, size, size, 0, c.RGBA, c.FLOAT, null)
                c.texParameteri(c.TEXTURE_2D, c.TEXTURE_MIN_FILTER, c.NEAREST)
                c.texParameteri(c.TEXTURE_2D, c.TEXTURE_MAG_FILTER, c.NEAREST)
                c.texParameteri(c.TEXTURE_2D, c.TEXTURE_WRAP_S, c.CLAMP_TO_EDGE)
                c.texParameteri(c.TEXTURE_2D, c.TEXTURE_WRAP_T, c.CLAMP_TO_EDGE)
                c.uniform1i(uniforms(key), storage.unit)
        }

        const setupComputeShader = () => {
                if (!gl.cs || computeProgram) return
                const config = { isWebGL: true, gl }
                const cs = fragment(gl.cs, config)
                const vs = `#version 300 es
in vec4 a_position;
void main() { gl_Position = a_position; }`
                computeProgram = createProgram(c, vs, cs, gl.error)!
                if (!computeProgram) return
                computeVao = c.createVertexArray()
                computeBuffer = c.createBuffer()
                c.bindVertexArray(computeVao)
                c.bindBuffer(c.ARRAY_BUFFER, computeBuffer)
                const quadVertices = new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1])
                c.bufferData(c.ARRAY_BUFFER, quadVertices, c.STATIC_DRAW)
                const posLoc = c.getAttribLocation(computeProgram, 'a_position')
                c.enableVertexAttribArray(posLoc)
                c.vertexAttribPointer(posLoc, 2, c.FLOAT, false, 0, 0)
                c.bindVertexArray(null)
        }

        const runComputeShader = () => {
                if (!gl.cs) return
                setupComputeShader()
                if (!computeProgram) return
                for (const [, storage] of storages.map) {
                        const outputTexture = storage.current === 0 ? storage.textureB : storage.textureA
                        const outputFramebuffer = storage.current === 0 ? storage.framebufferB : storage.framebufferA
                        c.bindFramebuffer(c.FRAMEBUFFER, outputFramebuffer)
                        c.framebufferTexture2D(c.FRAMEBUFFER, c.COLOR_ATTACHMENT0, c.TEXTURE_2D, outputTexture, 0)
                        const status = c.checkFramebufferStatus(c.FRAMEBUFFER)
                        if (status !== c.FRAMEBUFFER_COMPLETE) {
                                c.bindFramebuffer(c.FRAMEBUFFER, null)
                                return
                        }
                        c.viewport(0, 0, storage.width, storage.height)
                        c.useProgram(computeProgram)
                        c.bindVertexArray(computeVao)
                        const iTimeLoc = c.getUniformLocation(computeProgram, 'iTime')
                        c.uniform1f(iTimeLoc, performance.now() / 1000)
                        c.drawArrays(c.TRIANGLES, 0, 6)
                        c.bindVertexArray(null)
                        c.bindFramebuffer(c.FRAMEBUFFER, null)
                        storage.current = 1 - storage.current
                        break
                }
        }

        const clean = () => {
                c.deleteProgram(pg)
                if (computeProgram) c.deleteProgram(computeProgram)
                if (computeVao) c.deleteVertexArray(computeVao)
                if (computeBuffer) c.deleteBuffer(computeBuffer)
                for (const storage of storages.map.values()) {
                        c.deleteTexture(storage.textureA)
                        c.deleteTexture(storage.textureB)
                        c.deleteFramebuffer(storage.framebufferA)
                        c.deleteFramebuffer(storage.framebufferB)
                }
                c.getExtension('WEBGL_lose_context')?.loseContext()
                gl.el.width = 1
                gl.el.height = 1
        }

        const render = () => {
                runComputeShader()
                c.bindFramebuffer(c.FRAMEBUFFER, null)
                c.clear(c.COLOR_BUFFER_BIT)
                c.viewport(0, 0, ...gl.size)
                c.useProgram(pg)
                for (const [storageKey, storageData] of storages.map) {
                        const loc = uniforms(storageKey)
                        const currentTexture = storageData.current === 0 ? storageData.textureA : storageData.textureB
                        c.activeTexture(c.TEXTURE0 + storageData.unit)
                        c.bindTexture(c.TEXTURE_2D, currentTexture)
                        c.uniform1i(loc, storageData.unit)
                }
                c.drawArrays(c.TRIANGLES, 0, gl.count)
        }

        const webgl: WebGLState = { context: c, program: pg }

        return { webgl, render, clean, _attribute, _uniform, _texture, _storage }
}
