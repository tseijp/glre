/**
 * utils
 */
export function interleave(strings: readonly string[], args: any[]) {
        let result = strings[0]
        for (let i = 0, len = args.length; i < len; i += 1)
                result += args[i] + strings[i + 1]
        return result
}

export function isTemplateLiteral(strings: unknown): strings is string[] {
        return Array.isArray(strings) && typeof strings[0] === "string"
}

export function includes(source: string, target: string) {
        source = source.replace(/\s+/g, '')
        target = target.replace(/\s+/g, '')
        return source.includes(target)
}

export function concat(source: string, target: string, key = "") {
        if (key === "" || includes(source, key))
                if (!source.includes(target))
                        return target + source
        return source
}

export function switchUniformType(value: unknown, isMatrix = false) {
        let length = typeof value === "number" ? 0 : (value as any[]).length
        if (!length)  return [`uniform1f`, `float`]
        if (!isMatrix)  return [`uniform${length}fv`, `vec${length}`]
        length = Math.sqrt(length) << 0;
        return [`uniformMatrix${length}fv`, `mat${length}`]
}

/**
 * graphics
 */
export function createShader(gl, source, type) {
        const shader = gl.createShader(type)
        gl.shaderSource(shader, source)
        gl.compileShader(shader)
        if (gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
                return shader
        } else console.warn(gl.getShaderInfoLog(shader))
}

export function createProgram(gl, vs, fs) {
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

export function createVbo(gl, data) {
        if (!data) return
        const vbo = gl.createBuffer()
        gl.bindBuffer(gl.ARRAY_BUFFER, vbo)
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW)
        gl.bindBuffer(gl.ARRAY_BUFFER, null)
        return vbo
}

export function createIbo(gl, data) {
        if (!data) return
        const ibo = gl.createBuffer()
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo)
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Int16Array(data), gl.STATIC_DRAW)
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null)
        return ibo
}

export function createAttribute(gl, stride, location, value, iboValue) {
        gl.bindBuffer(gl.ARRAY_BUFFER, createVbo(gl, value))
        gl.enableVertexAttribArray(location)
        gl.vertexAttribPointer(location, stride, gl.FLOAT, false, 0, 0)
        if (iboValue)
                gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, createIbo(gl, iboValue))
}

export function createFramebuffer(gl, width, height) {
        const frameBuffer = gl.createFramebuffer()
        gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer)
        const renderBuffer = gl.createRenderbuffer()
        gl.bindRenderbuffer(gl.RENDERBUFFER, renderBuffer)
        gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, width, height)
        gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, renderBuffer)
        const texture = gl.createTexture()
        gl.bindTexture(gl.TEXTURE_2D, texture)
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0)
        gl.bindTexture(gl.TEXTURE_2D, null)
        gl.bindRenderbuffer(gl.RENDERBUFFER, null)
        gl.bindFramebuffer(gl.FRAMEBUFFER, null)
        return { frameBuffer, renderBuffer, texture }
}

export function createFramebufferFloat(gl, ext, width, height) {
        const flg = (ext.textureFloat != null) ? gl.FLOAT : ext.textureHalfFloat.HALF_FLOAT_OES
        const frameBuffer = gl.createFramebuffer()
        const texture = gl.createTexture()
        gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer)
        gl.bindTexture(gl.TEXTURE_2D, texture)
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, flg, null)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0)
        gl.bindTexture(gl.TEXTURE_2D, null)
        gl.bindFramebuffer(gl.FRAMEBUFFER, null)
        return { frameBuffer, texture }
}

export function createTexture(gl, img) {
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