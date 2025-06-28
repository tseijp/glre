import { fragment, isNodeProxy, vertex } from '../node'
import type { NodeProxy } from '../node'

export const defaultVertexGLSL = /* cpp */ `
#version 300 es
void main() {
  float x = float(gl_VertexID % 2) * 4.0 - 1.0;
  float y = float(gl_VertexID / 2) * 4.0 - 1.0;
  gl_Position = vec4(x, y, 0.0, 1.0);
}
`

export const defaultFragmentGLSL = /* cpp */ `
#version 300 es
precision mediump float;
uniform vec2 iResolution;
out vec4 fragColor;
void main() {
  fragColor = vec4(fract(gl_FragCoord.xy / iResolution), 0, 1);
}
`

const createShader = (c: WebGLRenderingContext, source: string, type: number) => {
        const shader = c.createShader(type)
        if (!shader) throw new Error('Failed to create shader')
        c.shaderSource(shader, source.trim())
        c.compileShader(shader)
        if (c.getShaderParameter(shader, c.COMPILE_STATUS)) return shader
        const error = c.getShaderInfoLog(shader)
        c.deleteShader(shader)
        console.warn(`Could not compile shader: ${error}`)
}

export const createProgram = (
        c: WebGLRenderingContext,
        vs: string | NodeProxy = defaultVertexGLSL,
        fs: string | NodeProxy = defaultFragmentGLSL,
        onError = () => {},
        gl?: any
) => {
        const config = { isWebGL: true, gl }
        if (isNodeProxy(fs)) fs = fragment(fs, config)
        if (isNodeProxy(vs)) vs = vertex(vs, config)
        const pg = c.createProgram()
        const _vs = createShader(c, vs, c.VERTEX_SHADER)
        const _fs = createShader(c, fs, c.FRAGMENT_SHADER)
        if (!_vs || !_fs) return onError()
        c.attachShader(pg, _vs)
        c.attachShader(pg, _fs)
        c.linkProgram(pg)
        if (c.getProgramParameter(pg, c.LINK_STATUS)) return pg
        const error = c.getProgramInfoLog(pg)
        c.deleteProgram(pg)
        onError()
        console.warn(`Could not link pg: ${error}`)
}

export const createVbo = (c: WebGLRenderingContext, data: number[]) => {
        const buffer = c.createBuffer()
        c.bindBuffer(c.ARRAY_BUFFER, buffer)
        c.bufferData(c.ARRAY_BUFFER, new Float32Array(data), c.STATIC_DRAW)
        c.bindBuffer(c.ARRAY_BUFFER, null)
        return buffer
}

export const createIbo = (c: WebGLRenderingContext, data: number[]) => {
        const buffer = c.createBuffer()
        c.bindBuffer(c.ELEMENT_ARRAY_BUFFER, buffer)
        c.bufferData(c.ELEMENT_ARRAY_BUFFER, new Int16Array(data), c.STATIC_DRAW)
        c.bindBuffer(c.ELEMENT_ARRAY_BUFFER, null)
        return buffer
}

export const getStride = (count: number, value: number[], iboValue?: number[]) => {
        if (iboValue) count = Math.max(...iboValue) + 1
        const stride = value.length / count
        return Math.floor(stride)
}

export const createAttrib = (
        c: WebGLRenderingContext,
        stride: number,
        loc: any,
        vbo: WebGLBuffer,
        ibo?: WebGLBuffer
) => {
        c.bindBuffer(c.ARRAY_BUFFER, vbo)
        c.enableVertexAttribArray(loc)
        c.vertexAttribPointer(loc, stride, c.FLOAT, false, 0, 0)
        if (ibo) c.bindBuffer(c.ELEMENT_ARRAY_BUFFER, ibo)
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
