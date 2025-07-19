import { fragment, vertex } from '../node'
import { is } from './helpers'
import type { X } from '../node'
import type { GL } from '../types'

const createShader = (c: WebGLRenderingContext, source: string, type: number, onError = console.warn) => {
        const shader = c.createShader(type)
        if (!shader) return onError('Failed to create shader')
        c.shaderSource(shader, source.trim())
        c.compileShader(shader)
        if (c.getShaderParameter(shader, c.COMPILE_STATUS)) return shader
        const error = c.getShaderInfoLog(shader)
        c.deleteShader(shader)
        onError(`Could not compile shader: ${error}`)
}

export const createProgram = (c: WebGLRenderingContext, vert: X, frag: X, gl: GL) => {
        if (!vert || !frag) return
        const config = { isWebGL: true, gl }
        frag = fragment(frag, config) // needs to be before vertex
        vert = vertex(vert, config)
        const pg = c.createProgram()
        const vs = createShader(c, vert, c.VERTEX_SHADER, gl.error)
        const fs = createShader(c, frag, c.FRAGMENT_SHADER, gl.error)
        if (!fs || !vs) return
        c.attachShader(pg, vs!)
        c.attachShader(pg, fs!)
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

const getStride = (count: number, value: number[], iboValue?: number[]) => {
        if (iboValue) count = Math.max(...iboValue) + 1
        const stride = value.length / count
        return Math.floor(stride)
}

export const createAttrib = (
        c: WebGLRenderingContext,
        loc: number,
        count: number,
        value: number[],
        iboValue: number[]
) => {
        const vbo = createVbo(c, value)
        const ibo = createIbo(c, iboValue)
        const str = getStride(count, value, iboValue)
        c.bindBuffer(c.ARRAY_BUFFER, vbo)
        c.enableVertexAttribArray(loc)
        c.vertexAttribPointer(loc, str, c.FLOAT, false, 0, 0)
        if (ibo) c.bindBuffer(c.ELEMENT_ARRAY_BUFFER, ibo)
}

export const createUniform = (c: WebGLRenderingContext, loc: WebGLUniformLocation, value: number | number[]) => {
        if (is.num(value)) return c.uniform1f(loc, value)
        let l = value.length
        if (l <= 4) return c[`uniform${l as 2}fv`](loc, value)
        l = Math.sqrt(l) << 0
        c[`uniformMatrix${l as 2}fv`](loc, false, value)
}

export const createTexture = (c: WebGLRenderingContext, img: HTMLImageElement, loc: any, unit: number) => {
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

export const createStorage = (c: WebGL2RenderingContext, size: number, storage: any, array: any) => {
        const data = new Float32Array(size * size * 4)
        for (let i = 0; i < array.length; i++) data[i * 4] = array[i]
        c.activeTexture(c.TEXTURE0 + storage.unit)
        c.bindTexture(c.TEXTURE_2D, storage.a.texture)
        c.texImage2D(c.TEXTURE_2D, 0, c.RGBA32F, size, size, 0, c.RGBA, c.FLOAT, data)
        c.texParameteri(c.TEXTURE_2D, c.TEXTURE_MIN_FILTER, c.NEAREST)
        c.texParameteri(c.TEXTURE_2D, c.TEXTURE_MAG_FILTER, c.NEAREST)
        c.texParameteri(c.TEXTURE_2D, c.TEXTURE_WRAP_S, c.CLAMP_TO_EDGE)
        c.texParameteri(c.TEXTURE_2D, c.TEXTURE_WRAP_T, c.CLAMP_TO_EDGE)
        c.bindTexture(c.TEXTURE_2D, storage.b.texture)
        c.texImage2D(c.TEXTURE_2D, 0, c.RGBA32F, size, size, 0, c.RGBA, c.FLOAT, null)
        c.texParameteri(c.TEXTURE_2D, c.TEXTURE_MIN_FILTER, c.NEAREST)
        c.texParameteri(c.TEXTURE_2D, c.TEXTURE_MAG_FILTER, c.NEAREST)
        c.texParameteri(c.TEXTURE_2D, c.TEXTURE_WRAP_S, c.CLAMP_TO_EDGE)
        c.texParameteri(c.TEXTURE_2D, c.TEXTURE_WRAP_T, c.CLAMP_TO_EDGE)
}
