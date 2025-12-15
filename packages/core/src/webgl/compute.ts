import { nested as cached } from 'reev'
import { cleanStorage, createAttachment, createProgram, createStorage, storageSize, updateUniform } from './utils'
import { GLSL_VS, is } from '../helpers'
import type { GL } from '../types'

export const compute = (c: WebGL2RenderingContext, gl: GL) => {
        if (!gl.cs) return
        c.getExtension('EXT_color_buffer_float') // ??

        let activeUnit = 0 // for texture units
        let currentNum = 0 // for storage buffers

        const units = cached(() => activeUnit++)
        const cs = is.str(gl.cs) ? gl.cs : gl.cs!.compute({ isWebGL: true, gl, units })
        const pg = createProgram(c, cs, GLSL_VS, gl)!
        const size = storageSize(gl.particleCount)

        const uniforms = cached((key) => c.getUniformLocation(pg, key)!)
        const storages = cached((key) => {
                const array = new Float32Array(size.x * size.y * 4) // RGBA texture data
                const ping = { texture: c.createTexture(), buffer: c.createFramebuffer() }
                const pong = { texture: c.createTexture(), buffer: c.createFramebuffer() }
                return { ping, pong, array, loc: uniforms(key), unit: units(key) }
        })

        gl('_uniform', (key: string, value: number | number[]) => {
                c.useProgram((gl.program = pg))
                updateUniform(c, uniforms(key), value)
        })

        gl('_storage', (key: string, value: number[]) => {
                c.useProgram((gl.program = pg))
                const { ping, pong, unit, array } = storages(key)
                createStorage(c, value, size.x, size.y, ping, pong, unit, array)
        })

        gl('clean', () => {
                c.deleteProgram(pg)
                cleanStorage(c, storages.map.values())
        })

        gl('render', () => {
                c.useProgram((gl.program = pg))
                const attachments = storages.map.values().map(({ ping, pong, loc, unit }, index) => {
                        const [i, o] = currentNum % 2 ? [ping, pong] : [pong, ping]
                        return createAttachment(c, i, o, loc, unit, index)
                })
                c.drawBuffers(attachments)
                c.drawArrays(c.TRIANGLES, 0, 3)
                c.bindFramebuffer(c.FRAMEBUFFER, null)
                currentNum++
        })
}

export type WebGLCompute = ReturnType<typeof compute>
