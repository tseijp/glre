const defaultVertexShader = /* cpp */ `
attribute vec4 a_position;
void main() {
  gl_Position = a_position;
}
`

const defaultFragmentShader = /* cpp */ `
precision mediump float;
uniform vec2 iResolution;
void main() {
  gl_FragColor = vec4(fract(gl_FragCoord.xy / iResolution), 0, 1);
}
`

export const deleteShader = (c: WebGLRenderingContext, shader: WebGLShader) => {
        c.deleteShader(shader)
}

// WebGLシェーダー作成と管理
const createShader = (
        c: WebGLRenderingContext,
        source: string,
        type: number
) => {
        const shader = c.createShader(type)
        if (!shader) throw new Error('Failed to create shader')
        c.shaderSource(shader, source)
        c.compileShader(shader)
        if (c.getShaderParameter(shader, c.COMPILE_STATUS)) return shader
        const error = c.getShaderInfoLog(shader)
        deleteShader(c, shader)
        throw new Error(`Could not compile shader: ${error}`)
}

export const createVertexShader = (
        c: WebGLRenderingContext,
        source = defaultVertexShader
) => {
        return createShader(c, source, c.VERTEX_SHADER)
}

export const createFragmentShader = (
        c: WebGLRenderingContext,
        source = defaultFragmentShader
) => {
        return createShader(c, source, c.FRAGMENT_SHADER)
}

// シェーダーの情報を取得
export const getShaderInfo = (
        c: WebGLRenderingContext,
        shader: WebGLShader
) => {
        return {
                compiled: c.getShaderParameter(shader, c.COMPILE_STATUS),
                log: c.getShaderInfoLog(shader),
                source: c.getShaderSource(shader),
        }
}
