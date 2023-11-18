/**
 * utils
 */
export const uniformType = (value: number | number[], isMatrix = false) => {
        let length = typeof value === 'number' ? 0 : value?.length
        if (!length) return `uniform1f`
        if (!isMatrix) return `uniform${length}fv`
        length = Math.sqrt(length) << 0
        return `uniformMatrix${length}fv`
}

export const vertexStride = (
        count: number,
        value: number[],
        iboValue?: number[]
) => {
        if (iboValue) count = Math.max(...iboValue) + 1
        const stride = value.length / count
        if (stride !== stride << 0)
                console.warn(`Vertex Stride Error: count ${count} is mismatch`)
        return stride << 0
}

/**
 * graphics
 */
export const createShader = (gl: any, source: string, type: unknown) => {
        const shader = gl.createShader(type)
        gl.shaderSource(shader, source)
        gl.compileShader(shader)
        if (gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
                return shader
        } else throw 'Could not compile glsl\n\n' + gl.getShaderInfoLog(shader)
}

export const createProgram = (gl: any, vs: any, fs: any) => {
        const program = gl.createProgram()
        gl.attachShader(program, vs)
        gl.attachShader(program, fs)
        gl.linkProgram(program)
        if (gl.getProgramParameter(program, gl.LINK_STATUS)) {
                gl.useProgram(program)
                return program
        } else {
                console.log(gl.getProgramInfoLog(program))
                return null
        }
}

export const createTfProgram = (gl: any, vs: any, fs: any, varyings?: any) => {
        const pg = gl.createProgram()
        gl.attachShader(pg, vs)
        gl.attachShader(pg, fs)
        gl.transformFeedbackVaryings(pg, varyings, gl.SEPARATE_ATTRIBS)
        gl.linkProgram(pg)
        if (gl.getProgramParameter(pg, gl.LINK_STATUS)) {
                gl.useProgram(pg)
                return pg
        } else {
                console.warn(gl.getProgramInfoLog(pg))
                return null
        }
}

export const createVbo = (gl: any, data: number[]) => {
        if (!data) return
        const vbo = gl.createBuffer()
        gl.bindBuffer(gl.ARRAY_BUFFER, vbo)
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW)
        gl.bindBuffer(gl.ARRAY_BUFFER, null)
        return vbo
}

export const createIbo = (gl: any, data?: number[]) => {
        if (!data) return
        const ibo = gl.createBuffer()
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo)
        gl.bufferData(
                gl.ELEMENT_ARRAY_BUFFER,
                new Int16Array(data),
                gl.STATIC_DRAW
        )
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null)
        return ibo
}

export const createAttribute = (
        gl: any,
        stride: number,
        location: any,
        vbo: any,
        ibo: any
) => {
        gl.bindBuffer(gl.ARRAY_BUFFER, vbo)
        gl.enableVertexAttribArray(location)
        gl.vertexAttribPointer(location, stride, gl.FLOAT, false, 0, 0)
        if (ibo) gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo)
}

export const createFramebuffer = (gl: any, width: number, height: number) => {
        const frameBuffer = gl.createFramebuffer()
        gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer)
        const renderBuffer = gl.createRenderbuffer()
        gl.bindRenderbuffer(gl.RENDERBUFFER, renderBuffer)
        gl.renderbufferStorage(
                gl.RENDERBUFFER,
                gl.DEPTH_COMPONENT16,
                width,
                height
        )
        gl.framebufferRenderbuffer(
                gl.FRAMEBUFFER,
                gl.DEPTH_ATTACHMENT,
                gl.RENDERBUFFER,
                renderBuffer
        )
        const texture = gl.createTexture()
        gl.bindTexture(gl.TEXTURE_2D, texture)
        gl.texImage2D(
                gl.TEXTURE_2D,
                0,
                gl.RGBA,
                width,
                height,
                0,
                gl.RGBA,
                gl.UNSIGNED_BYTE,
                null
        )
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
        gl.framebufferTexture2D(
                gl.FRAMEBUFFER,
                gl.COLOR_ATTACHMENT0,
                gl.TEXTURE_2D,
                texture,
                0
        )
        gl.bindTexture(gl.TEXTURE_2D, null)
        gl.bindRenderbuffer(gl.RENDERBUFFER, null)
        gl.bindFramebuffer(gl.FRAMEBUFFER, null)
        return { frameBuffer, renderBuffer, texture }
}

export const createFramebufferFloat = (
        gl: any,
        ext: any,
        width: number,
        height: number
) => {
        const flg =
                ext.textureFloat != null
                        ? gl.FLOAT
                        : ext.textureHalfFloat.HALF_FLOAT_OES
        const frameBuffer = gl.createFramebuffer()
        const texture = gl.createTexture()
        gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer)
        gl.bindTexture(gl.TEXTURE_2D, texture)
        gl.texImage2D(
                gl.TEXTURE_2D,
                0,
                gl.RGBA,
                width,
                height,
                0,
                gl.RGBA,
                flg,
                null
        )
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
        gl.framebufferTexture2D(
                gl.FRAMEBUFFER,
                gl.COLOR_ATTACHMENT0,
                gl.TEXTURE_2D,
                texture,
                0
        )
        gl.bindTexture(gl.TEXTURE_2D, null)
        gl.bindFramebuffer(gl.FRAMEBUFFER, null)
        return { frameBuffer, texture }
}

export const createTexture = (gl: any, img: any) => {
        const texture = gl.createTexture()
        gl.bindTexture(gl.TEXTURE_2D, texture)
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img)
        gl.generateMipmap(gl.TEXTURE_2D)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
        gl.bindTexture(gl.TEXTURE_2D, null)
        return texture
}

export const activeTexture = (
        gl: any,
        location: any,
        activeUnit: any,
        texture: any
) => {
        gl.uniform1i(location, activeUnit)
        gl.activeTexture(gl['TEXTURE' + activeUnit])
        gl.bindTexture(gl.TEXTURE_2D, texture)
}
