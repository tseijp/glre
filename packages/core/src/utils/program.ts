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

export const createProgram = (c: WebGLRenderingContext, vert: string, frag: string, onError = console.warn) => {
        const pg = c.createProgram()
        const fs = createShader(c, frag, c.FRAGMENT_SHADER, onError)
        const vs = createShader(c, vert, c.VERTEX_SHADER, onError)
        if (!fs || !vs) return
        c.attachShader(pg, vs!)
        c.attachShader(pg, fs!)
        c.linkProgram(pg)
        if (c.getProgramParameter(pg, c.LINK_STATUS)) return pg
        const error = c.getProgramInfoLog(pg)
        c.deleteProgram(pg)
        onError(`Could not link program: ${error}`)
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

export const createStorage = (
        c: WebGL2RenderingContext,
        value: number[] | Float32Array,
        unit: number,
        loc: WebGLUniformLocation | null,
        texture: WebGLTexture
) => {
        const array = value instanceof Float32Array ? value : new Float32Array(value)
        const size = Math.ceil(Math.sqrt(array.length))
        const data = new Float32Array(size * size * 4)
        for (let i = 0; i < array.length; i++) data[i * 4] = array[i]
        c.activeTexture(c.TEXTURE0 + unit)
        c.bindTexture(c.TEXTURE_2D, texture)
        c.texImage2D(c.TEXTURE_2D, 0, c.RGBA32F, size, size, 0, c.RGBA, c.FLOAT, data)
        c.texParameteri(c.TEXTURE_2D, c.TEXTURE_MIN_FILTER, c.NEAREST)
        c.texParameteri(c.TEXTURE_2D, c.TEXTURE_MAG_FILTER, c.NEAREST)
        c.texParameteri(c.TEXTURE_2D, c.TEXTURE_WRAP_S, c.CLAMP_TO_EDGE)
        c.texParameteri(c.TEXTURE_2D, c.TEXTURE_WRAP_T, c.CLAMP_TO_EDGE)
        c.uniform1i(loc, unit)
}
