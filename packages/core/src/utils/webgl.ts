import { nested as cached } from 'reev'
import { is, loadingImage } from './helpers'
import {
        cleanStorage,
        createAttachment,
        createAttrib,
        createInstanceAttrib,
        createProgram,
        createStorage,
        createTexture,
        createUniform,
} from './program'
import type { GL, WebGLState } from '../types'

const DEFAULT_FRAGMENT = /* cpp */ `
#version 300 es
precision mediump float;
out vec4 fragColor;
uniform vec2 iResolution;
void main() {
  fragColor = vec4(fract((gl_FragCoord.xy / iResolution)), 0.0, 1.0);
}
`

const DEFAULT_VERTEX = /* cpp */ `
#version 300 es
void main() {
  float x = float(gl_VertexID % 2) * 4.0 - 1.0;
  float y = float(gl_VertexID / 2) * 4.0 - 1.0;
  gl_Position = vec4(x, y, 0.0, 1.0);
}`

const computeProgram = (gl: GL, c: WebGL2RenderingContext) => {
        if (!gl.cs) return null // ignore if no compute shader
        c.getExtension('EXT_color_buffer_float')

        let activeUnit = 0 // for texture units
        let currentNum = 0 // for storage buffers

        const units = cached(() => activeUnit++)
        const cs = is.str(gl.cs) ? gl.cs : gl.cs!.compute({ isWebGL: true, gl, units })
        const pg = createProgram(c, cs, DEFAULT_VERTEX, gl)!
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
                createUniform(c, uniforms(key), value)
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
        const fs = gl.fs ? (is.str(gl.fs) ? gl.fs : gl.fs!.fragment(config)) : DEFAULT_FRAGMENT
        const vs = gl.vs ? (is.str(gl.vs) ? gl.vs : gl.vs!.vertex(config)) : DEFAULT_VERTEX
        const pg = createProgram(c, fs, vs, gl)!
        c.useProgram(pg)

        let activeUnit = 0 // for texture units

        const units = cached(() => activeUnit++)
        const attribs = cached((key) => c.getAttribLocation(pg, key))
        const uniforms = cached((key) => c.getUniformLocation(pg, key))

        const _attribute = (key = '', value: number[], iboValue: number[]) => {
                const loc = attribs(key)

                let flatValue: number[]
                if (Array.isArray(value[0])) {
                        flatValue = value[0] as number[]
                        console.log(`Using first sub-array for ${key}: length=${flatValue.length}`)
                } else {
                        flatValue = value
                        console.log(`Using flat array for ${key}: length=${flatValue.length}`)
                }

                // Simple heuristic: if attribute name contains 'instance', treat as instance attribute
                const isInstanceAttribute = key.toLowerCase().includes('instance')
                if (isInstanceAttribute && gl.instance > 1) {
                        createInstanceAttrib(c, loc, flatValue, gl.instance)
                } else {
                        createAttrib(c, loc, gl.count, flatValue, iboValue)
                }
        }

        const _uniform = (key: string, value: number | number[]) => {
                c.useProgram(pg)
                createUniform(c, uniforms(key)!, value)
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
                if (gl.instance > 1) {
                        c.drawArraysInstanced(c.TRIANGLES, 0, gl.count, gl.instance)
                } else {
                        c.drawArrays(c.TRIANGLES, 0, gl.count)
                }
                c.bindFramebuffer(c.FRAMEBUFFER, null)
        }

        const webgl: WebGLState = { context: c, program: pg, storages: cp?.storages }

        return { webgl, render, clean, _attribute, _uniform, _texture, _storage: cp?._storage }
}
