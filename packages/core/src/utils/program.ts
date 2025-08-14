import { is } from './helpers'
import type { GL } from '../types'

const createShader = (c: WebGLRenderingContext, source: string, type: number, onError = console.warn) => {
        const shader = c.createShader(type)
        if (!shader) return onError('Failed to create shader')
        c.shaderSource(shader, source.trim())
        c.compileShader(shader)
        if (c.getShaderParameter(shader, c.COMPILE_STATUS)) return shader
        const error = c.getShaderInfoLog(shader)
        c.deleteShader(shader)
        onError(`Could not compile shader: ${error}\n\n↓↓↓generated↓↓↓\n${source}`)
}

export const createProgram = (c: WebGLRenderingContext, frag: string, vert: string, gl: GL) => {
        const pg = c.createProgram()
        const fs = createShader(c, frag, c.FRAGMENT_SHADER, gl.error)
        const vs = createShader(c, vert, c.VERTEX_SHADER, gl.error)
        if (!fs || !vs) return
        c.attachShader(pg, fs!)
        c.attachShader(pg, vs!)
        c.linkProgram(pg)
        if (c.getProgramParameter(pg, c.LINK_STATUS)) return pg
        const error = c.getProgramInfoLog(pg)
        c.deleteProgram(pg)
        gl.error(`Could not link program: ${error}`)
}

const createVbo = (c: WebGLRenderingContext, data: number[]) => {
        const buffer = c.createBuffer()
        c.bindBuffer(c.ARRAY_BUFFER, buffer)
        c.bufferData(c.ARRAY_BUFFER, new Float32Array(data), c.STATIC_DRAW)
        c.bindBuffer(c.ARRAY_BUFFER, null)
        return buffer
}

const createIbo = (c: WebGLRenderingContext, data: number[]) => {
        const buffer = c.createBuffer()
        c.bindBuffer(c.ELEMENT_ARRAY_BUFFER, buffer)
        c.bufferData(c.ELEMENT_ARRAY_BUFFER, new Int16Array(data), c.STATIC_DRAW)
        c.bindBuffer(c.ELEMENT_ARRAY_BUFFER, null)
        return buffer
}

export const createAttrib = (
        c: WebGLRenderingContext,
        loc: number,
        stride: number,
        value: number[],
        iboValue?: number[]
) => {
        const vbo = createVbo(c, value)
        c.bindBuffer(c.ARRAY_BUFFER, vbo)
        c.enableVertexAttribArray(loc)
        c.vertexAttribPointer(loc, stride, c.FLOAT, false, 0, 0)
        if (iboValue) {
                const ibo = createIbo(c, iboValue)
                c.bindBuffer(c.ELEMENT_ARRAY_BUFFER, ibo)
        }
}

export const createInstanceAttrib = (
        c: WebGL2RenderingContext,
        loc: number,
        stride: number,
        value: number[],
        divisor: number = 1
) => {
        const vbo = createVbo(c, value)
        c.bindBuffer(c.ARRAY_BUFFER, vbo)
        c.enableVertexAttribArray(loc)
        c.vertexAttribPointer(loc, stride, c.FLOAT, false, 0, 0)
        c.vertexAttribDivisor(loc, divisor)
        return vbo
}

export const createUniform = (c: WebGLRenderingContext, loc: WebGLUniformLocation, value: number | number[]) => {
        if (is.num(value)) return c.uniform1f(loc, value)
        let l = value.length
        if (l <= 4) return c[`uniform${l as 2}fv`](loc, value)
        l = Math.sqrt(l) << 0
        c[`uniformMatrix${l as 2}fv`](loc, false, value)
}

export const createTexture = (
        c: WebGLRenderingContext,
        img: HTMLImageElement,
        loc: WebGLUniformLocation,
        unit: number
) => {
        const texture = c.createTexture()
        c.bindTexture(c.TEXTURE_2D, texture)
        c.texImage2D(c.TEXTURE_2D, 0, c.RGBA, c.RGBA, c.UNSIGNED_BYTE, img)
        c.generateMipmap(c.TEXTURE_2D)
        c.texParameteri(c.TEXTURE_2D, c.TEXTURE_MIN_FILTER, c.LINEAR)
        c.texParameteri(c.TEXTURE_2D, c.TEXTURE_MAG_FILTER, c.LINEAR)
        c.texParameteri(c.TEXTURE_2D, c.TEXTURE_WRAP_S, c.CLAMP_TO_EDGE)
        c.texParameteri(c.TEXTURE_2D, c.TEXTURE_WRAP_T, c.CLAMP_TO_EDGE)
        c.bindTexture(c.TEXTURE_2D, null)
        c.uniform1i(loc, unit)
        c.activeTexture(c.TEXTURE0 + unit)
        c.bindTexture(c.TEXTURE_2D, texture)
}

/**
 * for gpgpu
 */
interface TextureBuffer {
        texture: WebGLTexture
        buffer: WebGLFramebuffer
}

export const createStorage = (
        c: WebGL2RenderingContext,
        value: number[],
        size: number,
        ping: TextureBuffer,
        pong: TextureBuffer,
        unit: number,
        array: Float32Array
) => {
        const particles = size * size
        const vectorSize = value.length / particles
        for (let i = 0; i < particles; i++) {
                for (let j = 0; j < Math.min(vectorSize, 4); j++) {
                        array[4 * i + j] = value[i * vectorSize + j] || 0
                }
        }
        c.activeTexture(c.TEXTURE0 + unit)
        c.bindTexture(c.TEXTURE_2D, ping.texture)
        c.texImage2D(c.TEXTURE_2D, 0, c.RGBA32F, size, size, 0, c.RGBA, c.FLOAT, array)
        c.texParameteri(c.TEXTURE_2D, c.TEXTURE_MIN_FILTER, c.NEAREST)
        c.texParameteri(c.TEXTURE_2D, c.TEXTURE_MAG_FILTER, c.NEAREST)
        c.texParameteri(c.TEXTURE_2D, c.TEXTURE_WRAP_S, c.CLAMP_TO_EDGE)
        c.texParameteri(c.TEXTURE_2D, c.TEXTURE_WRAP_T, c.CLAMP_TO_EDGE)
        c.bindTexture(c.TEXTURE_2D, pong.texture)
        c.texImage2D(c.TEXTURE_2D, 0, c.RGBA32F, size, size, 0, c.RGBA, c.FLOAT, array)
        c.texParameteri(c.TEXTURE_2D, c.TEXTURE_MIN_FILTER, c.NEAREST)
        c.texParameteri(c.TEXTURE_2D, c.TEXTURE_MAG_FILTER, c.NEAREST)
        c.texParameteri(c.TEXTURE_2D, c.TEXTURE_WRAP_S, c.CLAMP_TO_EDGE)
        c.texParameteri(c.TEXTURE_2D, c.TEXTURE_WRAP_T, c.CLAMP_TO_EDGE)
}

export const cleanStorage = (
        c: WebGL2RenderingContext,
        map: Iterable<{ ping: TextureBuffer; pong: TextureBuffer }>
) => {
        for (const { ping, pong } of map) {
                c.deleteTexture(ping.texture)
                c.deleteTexture(pong.texture)
                c.deleteFramebuffer(ping.buffer)
                c.deleteFramebuffer(pong.buffer)
        }
}

export const createAttachment = (
        c: WebGL2RenderingContext,
        i: TextureBuffer,
        o: TextureBuffer,
        loc: WebGLUniformLocation,
        unit: number,
        index: number
) => {
        c.activeTexture(c.TEXTURE0 + unit)
        c.bindTexture(c.TEXTURE_2D, i.texture)
        c.uniform1i(loc, unit)
        if (index === 0) c.bindFramebuffer(c.FRAMEBUFFER, o.buffer)
        const attachment = c.COLOR_ATTACHMENT0 + index
        c.framebufferTexture2D(c.FRAMEBUFFER, attachment, c.TEXTURE_2D, o.texture, 0)
        return attachment
}
