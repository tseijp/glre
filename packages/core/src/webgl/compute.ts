import { nested } from 'reev'
import { cleanStorage, createAttachment, createProgram, createStorage, storageSize, updateUniform } from './utils'
import { GLSL_VS, is } from '../helpers'
import type { GL } from '../types'

export const compute = (gl: GL): Partial<GL> => {
        let { cs, particleCount, context: c, storages } = gl
        if (!cs) return {}
        c.getExtension('EXT_color_buffer_float') // Enable high precision GPGPU by writing to float textures

        let _texture = 0 // for texture active units
        let _storage = 0 // for storage current num

        const units = nested(() => _texture++)
        cs = is.str(cs) ? cs : cs!.compute({ isWebGL: true, gl, units })
        const pg = createProgram(c, cs, GLSL_VS, gl)!
        const size = storageSize(particleCount)
        const _uniforms = nested((key) => c.getUniformLocation(pg, key)!)
        const _storages = nested((key) => {
                const array = new Float32Array(size.x * size.y * 4) // RGBA texture data
                const ping = { texture: c.createTexture(), buffer: c.createFramebuffer() }
                const pong = { texture: c.createTexture(), buffer: c.createFramebuffer() }
                return { ping, pong, array, loc: _uniforms(key), unit: units(key) }
        })
        return {
                _uniform(key: string, value: number | number[]) {
                        c.useProgram((gl.program = pg))
                        updateUniform(c, _uniforms(key), value)
                },
                _storage(key: string, value: number[]) {
                        if (storages && !(key in storages)) return
                        c.useProgram((gl.program = pg))
                        const { ping, pong, unit, array } = _storages(key)
                        createStorage(c, value, size.x, size.y, ping, pong, unit, array)
                },
                clean() {
                        c.deleteProgram(pg)
                        cleanStorage(c, _storages.map.values())
                },
                render() {
                        c.useProgram((gl.program = pg))
                        const attachments = _storages.map.values().map(({ ping, pong, loc, unit }, index) => {
                                const [i, o] = _storage % 2 ? [ping, pong] : [pong, ping]
                                return createAttachment(c, i, o, loc, unit, index)
                        })
                        c.drawBuffers(attachments)
                        c.drawArrays(c.TRIANGLES, 0, 3)
                        c.bindFramebuffer(c.FRAMEBUFFER, null)
                        _storage++
                },
        } as Partial<GL>
}

export type WebGLCompute = ReturnType<typeof compute>
