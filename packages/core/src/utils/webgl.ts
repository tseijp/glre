import { nested as cached } from 'reev'
import { is, loadingImage, getStride, GLSL_VS, GLSL_FS } from './helpers'
import {
        createArrayBuffer,
        cleanStorage,
        createAttachment,
        createProgram,
        createStorage,
        createTexture,
        setArrayBuffer,
        updateAttrib,
        updateInstance,
        updateUniform,
} from './program'
import type { GL, WebGLState } from '../types'

const computeProgram = (gl: GL, c: WebGL2RenderingContext) => {
        if (!gl.cs) return null // ignore if no compute shader
        c.getExtension('EXT_color_buffer_float')

        let activeUnit = 0 // for texture units
        let currentNum = 0 // for storage buffers

        const units = cached(() => activeUnit++)
        const cs = is.str(gl.cs) ? gl.cs : gl.cs!.compute({ isWebGL: true, gl, units })
        const pg = createProgram(c, cs, GLSL_VS, gl)!
        const size = Math.ceil(Math.sqrt(gl.particles))

        const uniforms = cached((key) => c.getUniformLocation(pg, key)!)
        const storages = cached((key) => {
                const array = new Float32Array(size * size * 4) // RGBA texture data
                const ping = { texture: c.createTexture(), buffer: c.createFramebuffer() }
                const pong = { texture: c.createTexture(), buffer: c.createFramebuffer() }
                return { ping, pong, array, loc: uniforms(key), unit: units(key) }
        })

        const _uniform = (key: string, value: number | number[]) => {
                c.useProgram(pg)
                updateUniform(c, uniforms(key), value)
        }

        const _storage = (key: string, value: number[]) => {
                const { ping, pong, unit, array } = storages(key)
                createStorage(c, value, size, ping, pong, unit, array)
        }

        const clean = () => {
                c.deleteProgram(pg)
                cleanStorage(c, storages.map.values())
        }

        const render = () => {
                c.useProgram(pg)
                const attachments = storages.map.values().map(({ ping, pong, loc, unit }, index) => {
                        const [i, o] = currentNum % 2 ? [ping, pong] : [pong, ping]
                        return createAttachment(c, i, o, loc, unit, index)
                })
                c.drawBuffers(attachments)
                c.drawArrays(c.TRIANGLES, 0, 3)
                c.bindFramebuffer(c.FRAMEBUFFER, null)
                currentNum++
        }

        return { render, clean, _uniform, _storage, storages }
}

export const webgl = async (gl: GL) => {
        const config = { isWebGL: true, gl }
        const c = gl.el!.getContext('webgl2')!
        const cp = computeProgram(gl, c)
        const fs = gl.fs ? (is.str(gl.fs) ? gl.fs : gl.fs!.fragment(config)) : GLSL_FS
        const vs = gl.vs ? (is.str(gl.vs) ? gl.vs : gl.vs!.vertex(config)) : GLSL_VS
        const pg = createProgram(c, fs, vs, gl)!
        c.useProgram(pg)

        let activeUnit = 0 // for texture units

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
                setArrayBuffer(c, array, buffer, value)
                updateAttrib(c, location, stride, buffer)
        }

        const _instance = (key: string, value: number[]) => {
                const { array, buffer, location, stride } = attribs(key, value, true)
                setArrayBuffer(c, array, buffer, value)
                updateInstance(c, location, stride, buffer)
        }

        const _uniform = (key: string, value: number | number[]) => {
                c.useProgram(pg)
                updateUniform(c, uniforms(key)!, value)
                cp?._uniform(key, value)
        }

        const _texture = (key: string, src: string) => {
                c.useProgram(pg)
                loadingImage(gl, src, (source) => {
                        createTexture(c, source, uniforms(key)!, units(key))
                })
        }

        const clean = () => {
                cp?.clean()
                c.deleteProgram(pg)
                c.getExtension('WEBGL_lose_context')?.loseContext()
        }

        const render = () => {
                cp?.render()
                c.useProgram(pg)
                c.viewport(0, 0, ...gl.size)
                if (gl.instanceCount > 1) {
                        c.drawArraysInstanced(c.TRIANGLES, 0, gl.count, gl.instanceCount)
                } else c.drawArrays(c.TRIANGLES, 0, gl.count)
                c.bindFramebuffer(c.FRAMEBUFFER, null)
        }

        if (gl.isDepth) {
                c.depthFunc(c.LEQUAL)
                c.enable(c.CULL_FACE)
        }

        const webgl: WebGLState = { context: c, program: pg, storages: cp?.storages }

        return { webgl, render, clean, _attribute, _instance, _uniform, _texture, _storage: cp?._storage }
}
