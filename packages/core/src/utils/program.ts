export const defaultVertexGLSL = /* cpp */ `
attribute vec4 a_position;
void main() {
  gl_Position = a_position;
}
`

export const defaultFragmentGLSL = /* cpp */ `
precision mediump float;
uniform vec2 iResolution;
void main() {
  gl_FragColor = vec4(fract(gl_FragCoord.xy / iResolution), 0, 1);
}
`

export const createShader = (c: WebGLRenderingContext, source: string, type: number) => {
        const shader = c.createShader(type)
        if (!shader) throw new Error('Failed to create shader')
        c.shaderSource(shader, source)
        c.compileShader(shader)
        if (c.getShaderParameter(shader, c.COMPILE_STATUS)) return shader
        const error = c.getShaderInfoLog(shader)
        c.deleteShader(shader)
        throw new Error(`Could not compile shader: ${error}`)
}

export const createProgram = (c: WebGLRenderingContext, vs = defaultVertexGLSL, fs = defaultFragmentGLSL) => {
        const pg = c.createProgram()
        if (!pg) throw new Error('Failed to create pg')
        c.attachShader(pg, createShader(c, vs, c.VERTEX_SHADER))
        c.attachShader(pg, createShader(c, fs, c.FRAGMENT_SHADER))
        c.linkProgram(pg)
        if (c.getProgramParameter(pg, c.LINK_STATUS)) return pg
        const error = c.getProgramInfoLog(pg)
        c.deleteProgram(pg)
        throw new Error(`Could not link pg: ${error}`)
}

export const createVbo = (c: WebGLRenderingContext, data: number[]) => {
        const buffer = c.createBuffer()
        if (!buffer) throw new Error('Failed to create VBO')
        c.bindBuffer(c.ARRAY_BUFFER, buffer)
        c.bufferData(c.ARRAY_BUFFER, new Float32Array(data), c.STATIC_DRAW)
        c.bindBuffer(c.ARRAY_BUFFER, null)
        return buffer
}

export const createIbo = (c: WebGLRenderingContext, data: number[]) => {
        const buffer = c.createBuffer()
        if (!buffer) throw new Error('Failed to create IBO')
        c.bindBuffer(c.ELEMENT_ARRAY_BUFFER, buffer)
        c.bufferData(c.ELEMENT_ARRAY_BUFFER, new Int16Array(data), c.STATIC_DRAW)
        c.bindBuffer(c.ELEMENT_ARRAY_BUFFER, null)
        return buffer
}

export const createAttrib = (
        c: WebGLRenderingContext,
        stride: number,
        location: any,
        vbo: WebGLBuffer,
        ibo?: WebGLBuffer
) => {
        c.bindBuffer(c.ARRAY_BUFFER, vbo)
        c.enableVertexAttribArray(location)
        c.vertexAttribPointer(location, stride, c.FLOAT, false, 0, 0)
        if (ibo) c.bindBuffer(c.ELEMENT_ARRAY_BUFFER, ibo)
}

export const createTexture = (c: WebGLRenderingContext, img: HTMLImageElement) => {
        const texture = c.createTexture()
        if (!texture) throw new Error('Failed to create texture')
        c.bindTexture(c.TEXTURE_2D, texture)
        c.texImage2D(c.TEXTURE_2D, 0, c.RGBA, c.RGBA, c.UNSIGNED_BYTE, img)
        c.generateMipmap(c.TEXTURE_2D)
        c.texParameteri(c.TEXTURE_2D, c.TEXTURE_MIN_FILTER, c.LINEAR)
        c.texParameteri(c.TEXTURE_2D, c.TEXTURE_MAG_FILTER, c.LINEAR)
        c.texParameteri(c.TEXTURE_2D, c.TEXTURE_WRAP_S, c.CLAMP_TO_EDGE)
        c.texParameteri(c.TEXTURE_2D, c.TEXTURE_WRAP_T, c.CLAMP_TO_EDGE)
        c.bindTexture(c.TEXTURE_2D, null)
        return texture
}

export const activeTexture = (
        c: WebGLRenderingContext,
        location: WebGLUniformLocation | null,
        unit: number,
        texture: WebGLTexture
) => {
        if (!location) return
        c.uniform1i(location, unit)
        c.activeTexture(c.TEXTURE0 + unit)
        c.bindTexture(c.TEXTURE_2D, texture)
}
