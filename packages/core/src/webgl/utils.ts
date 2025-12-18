import { is } from '../helpers'
import type { GL } from '../types'

const createShader = (c: WebGL2RenderingContext, source: string, type: number, onError = console.warn) => {
        const shader = c.createShader(type)
        if (!shader) return onError('Failed to create shader')
        c.shaderSource(shader, source.trim())
        c.compileShader(shader)
        if (c.getShaderParameter(shader, c.COMPILE_STATUS)) return shader
        const error = c.getShaderInfoLog(shader)
        c.deleteShader(shader)
        onError(`Could not compile shader: ${error}\n\n↓↓↓generated↓↓↓\n${source}`)
}

export const createProgram = (c: WebGL2RenderingContext, frag: string, vert: string, gl: GL) => {
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

export const createBuffer = (c: WebGL2RenderingContext, data: number[]) => {
        const array = new Float32Array(data)
        const buffer = c.createBuffer()
        return { array, buffer }
}

export const updateBuffer = (c: WebGL2RenderingContext, array: Float32Array, buffer: WebGLBuffer, value: number[]) => {
        array.set(value)
        c.bindBuffer(c.ARRAY_BUFFER, buffer)
        c.bufferData(c.ARRAY_BUFFER, array, c.STATIC_DRAW)
        c.bindBuffer(c.ARRAY_BUFFER, null)
}

export const updateAttrib = (c: WebGL2RenderingContext, loc: number, stride: number, buffer: WebGLBuffer) => {
        c.bindBuffer(c.ARRAY_BUFFER, buffer)
        c.enableVertexAttribArray(loc)
        c.vertexAttribPointer(loc, stride, c.FLOAT, false, 0, 0)
}

export const updateInstance = (c: WebGL2RenderingContext, loc: number, stride: number, buffer: WebGLBuffer) => {
        c.bindBuffer(c.ARRAY_BUFFER, buffer)
        c.enableVertexAttribArray(loc)
        c.vertexAttribPointer(loc, stride, c.FLOAT, false, 0, 0)
        c.vertexAttribDivisor(loc, 1) // divisor is 1
}

export const updateUniform = (c: WebGL2RenderingContext, loc: WebGLUniformLocation | null, value: number | number[]) => {
        if (is.nul(loc)) return
        if (is.num(value)) return c.uniform1f(loc, value)
        let l = value.length
        if (l <= 4) return c[`uniform${l as 2}fv`](loc, value)
        l = Math.sqrt(l) << 0
        c[`uniformMatrix${l as 2}fv`](loc, false, value)
}

export const createTexture = (c: WebGL2RenderingContext, el: HTMLImageElement | HTMLVideoElement | null, loc: WebGLUniformLocation | null, unit: number, isVideo = false) => {
        const texture = c.createTexture()
        c.bindTexture(c.TEXTURE_2D, texture)
        if (el) {
                c.texImage2D(c.TEXTURE_2D, 0, c.RGBA, c.RGBA, c.UNSIGNED_BYTE, el)
                if (!isVideo) c.generateMipmap(c.TEXTURE_2D)
        } else {
                c.texImage2D(c.TEXTURE_2D, 0, c.RGBA, 1, 1, 0, c.RGBA, c.UNSIGNED_BYTE, new Uint8Array([0, 0, 0, 0]))
        }
        c.texParameteri(c.TEXTURE_2D, c.TEXTURE_MIN_FILTER, c.LINEAR)
        c.texParameteri(c.TEXTURE_2D, c.TEXTURE_MAG_FILTER, c.LINEAR)
        c.texParameteri(c.TEXTURE_2D, c.TEXTURE_WRAP_S, c.CLAMP_TO_EDGE)
        c.texParameteri(c.TEXTURE_2D, c.TEXTURE_WRAP_T, c.CLAMP_TO_EDGE)
        c.bindTexture(c.TEXTURE_2D, null)
        c.uniform1i(loc, unit)
        c.activeTexture(c.TEXTURE0 + unit)
        c.bindTexture(c.TEXTURE_2D, texture)
        if (isVideo)
                return () => {
                        c.activeTexture(c.TEXTURE0 + unit)
                        c.bindTexture(c.TEXTURE_2D, texture)
                        c.texImage2D(c.TEXTURE_2D, 0, c.RGBA, c.RGBA, c.UNSIGNED_BYTE, el!)
                }
}

/**
 * for gpgpu
 */
interface TextureBuffer {
        texture: WebGLTexture
        buffer: WebGLFramebuffer
}

export const createStorage = (c: WebGL2RenderingContext, value: number[], width: number, height: number, ping: TextureBuffer, pong: TextureBuffer, unit: number, array: Float32Array) => {
        const particleCount = width * height
        const vectorSize = value.length / particleCount
        for (let i = 0; i < particleCount; i++) {
                for (let j = 0; j < Math.min(vectorSize, 4); j++) {
                        array[4 * i + j] = value[i * vectorSize + j] || 0
                }
        }
        c.activeTexture(c.TEXTURE0 + unit)
        c.bindTexture(c.TEXTURE_2D, ping.texture)
        c.texImage2D(c.TEXTURE_2D, 0, c.RGBA32F, width, height, 0, c.RGBA, c.FLOAT, array)
        c.texParameteri(c.TEXTURE_2D, c.TEXTURE_MIN_FILTER, c.NEAREST)
        c.texParameteri(c.TEXTURE_2D, c.TEXTURE_MAG_FILTER, c.NEAREST)
        c.texParameteri(c.TEXTURE_2D, c.TEXTURE_WRAP_S, c.CLAMP_TO_EDGE)
        c.texParameteri(c.TEXTURE_2D, c.TEXTURE_WRAP_T, c.CLAMP_TO_EDGE)
        c.bindTexture(c.TEXTURE_2D, pong.texture)
        c.texImage2D(c.TEXTURE_2D, 0, c.RGBA32F, width, height, 0, c.RGBA, c.FLOAT, array)
        c.texParameteri(c.TEXTURE_2D, c.TEXTURE_MIN_FILTER, c.NEAREST)
        c.texParameteri(c.TEXTURE_2D, c.TEXTURE_MAG_FILTER, c.NEAREST)
        c.texParameteri(c.TEXTURE_2D, c.TEXTURE_WRAP_S, c.CLAMP_TO_EDGE)
        c.texParameteri(c.TEXTURE_2D, c.TEXTURE_WRAP_T, c.CLAMP_TO_EDGE)
}

export const cleanStorage = (c: WebGL2RenderingContext, map: Iterable<{ ping: TextureBuffer; pong: TextureBuffer }>) => {
        for (const { ping, pong } of map) {
                c.deleteTexture(ping.texture)
                c.deleteTexture(pong.texture)
                c.deleteFramebuffer(ping.buffer)
                c.deleteFramebuffer(pong.buffer)
        }
}

export const createAttachment = (c: WebGL2RenderingContext, i: TextureBuffer, o: TextureBuffer, loc: WebGLUniformLocation, unit: number, index: number) => {
        c.activeTexture(c.TEXTURE0 + unit)
        c.bindTexture(c.TEXTURE_2D, i.texture)
        c.uniform1i(loc, unit)
        if (index === 0) c.bindFramebuffer(c.FRAMEBUFFER, o.buffer)
        const attachment = c.COLOR_ATTACHMENT0 + index
        c.framebufferTexture2D(c.FRAMEBUFFER, attachment, c.TEXTURE_2D, o.texture, 0)
        return attachment
}

/**
 * utils
 */
export const storageSize = (particleCount: number | number[] = 1024) => {
        if (is.num(particleCount)) {
                const sqrt = Math.sqrt(particleCount)
                const size = Math.ceil(sqrt)
                if (!Number.isInteger(sqrt)) console.warn(`GLRE Storage Warning: particleCount (${particleCount}) is not a square. Using ${size}x${size} texture may waste GPU memory. Consider using [width, height] format for optimal storage.`)
                return { x: size, y: size }
        }
        const [x, y, z] = particleCount
        if (z !== undefined) {
                const yz = y * z
                console.warn(`GLRE Storage Warning: 3D particleCount [${x}, ${y}, ${z}] specified but WebGL storage textures only support 2D. Flattening to 2D by multiplying height=${y} * depth=${z} = ${yz}.`)
                return { x, y: yz }
        }
        return { x, y }
}

export const loseContext = (c: WebGL2RenderingContext) => {
        const ext = c.getExtension('WEBGL_lose_context')
        if (ext) ext.loseContext()
}

export const enableDepth = (c: WebGL2RenderingContext) => {
        c.enable(c.DEPTH_TEST)
        c.depthFunc(c.LEQUAL)
        c.enable(c.CULL_FACE)
        c.cullFace(c.BACK)
}

export const enableWireframe = (c: WebGL2RenderingContext) => {
        const ext = c.getExtension('WEBGL_polygon_mode')
        if (ext) ext.polygonModeWEBGL(c.FRONT_AND_BACK, ext.LINE_WEBGL)
}
