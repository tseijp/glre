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

export function lookAt(eye = [0, 0, 3], center = [0, 0, 0], up = [0, 1, 0]) {
        const ret = new Float32Array(16)
        const [ex, ey, ez] = eye
        const [cx, cy, cz] = center
        const [ux, uy, uz] = up
        let [z0, z1, z2] = [ex - cx, ey - cy, ez - cz]
        let lz = 1 / Math.sqrt(z0 ** 2 + z1 ** 2 + z2 ** 2)
        ;[z0, z1, z2] = !lz ? [0, 0, 0] : [z0 * lz, z1 * lz, z2 * lz]
        let [x0, x1, x2] = [uy * z2 - uz * z1, uz * z0 - ux * z2, ux * z1 - uy * z0]
        let lx = 1 / Math.sqrt(x0 ** 2 + x1 ** 2 + x2 ** 2)
        ;[x0, x1, x2] = !lx ? [0, 0, 0] : [x0 * lx, x1 * lx, x2 * lx]
        let [y0, y1, y2] = [z1 * x2 - z2 * x1, z2 * x0 - z0 * x2, z0 * x1 - z1 * x0]
        let ly = 1 / Math.sqrt(y0 ** 2 + y1 ** 2 + y2 ** 2)
        ;[y0, y1, y2] = !ly ? [0, 0, 0] : [y0 * ly, y1 * ly, y2 * ly]
        ret[0] = x0
        ret[1] = y0
        ret[2] = z0
        ret[3] = 0
        ret[4] = x1
        ret[5] = y1
        ret[6] = z1
        ret[7] = 0
        ret[8] = x2
        ret[9] = y2
        ret[10] = z2
        ret[11] = 0
        ret[12] = -(x0 * ex + x1 * ey + x2 * ez)
        ret[13] = -(y0 * ex + y1 * ey + y2 * ez)
        ret[14] = -(z0 * ex + z1 * ey + z2 * ez)
        ret[15] = 1
        return ret
}

export function perspective(fovy = 60, aspect = 1, near = 0.1, far = 10) {
        const ret = new Float32Array(16)
        const r = 1 / Math.tan((fovy * Math.PI) / 360)
        const d = far - near
        ret[0] = r / aspect
        ret[1] = ret[2] = ret[3] = ret[4] = 0
        ret[6] = ret[7] = ret[8] = ret[9] = 0
        ret[12] = ret[13] = ret[15] = 0
        ret[5] = r
        ret[10] = -(far + near) / d
        ret[11] = -1
        ret[14] = -(far * near * 2) / d
        return ret
}

export function identity() {
        const ret = new Float32Array(16)
        ret[1] = ret[2] = ret[3] = ret[4] = 0
        ret[6] = ret[7] = ret[8] = ret[9] = 0
        ret[11] = ret[12] = ret[13] = ret[14] = 0
        ret[0] = ret[5] = ret[10] = ret[15] = 1
        return ret
}
