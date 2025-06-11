// WebGLプログラム作成と管理
export const createProgram = (
        c: WebGLRenderingContext,
        vs: WebGLShader,
        fs: WebGLShader
) => {
        const pg = c.createProgram()
        if (!pg) throw new Error('Failed to create pg')
        c.attachShader(pg, vs)
        c.attachShader(pg, fs)
        c.linkProgram(pg)
        if (c.getProgramParameter(pg, c.LINK_STATUS)) return pg
        const error = c.getProgramInfoLog(pg)
        c.deleteProgram(pg)
        throw new Error(`Could not link pg: ${error}`)
}

// プログラムの削除
export const deleteProgram = (c: WebGLRenderingContext, pg: WebGLProgram) => {
        c.deleteProgram(pg)
}

// プログラムの情報を取得
export const getProgramInfo = (c: WebGLRenderingContext, pg: WebGLProgram) => {
        return {
                linked: c.getProgramParameter(pg, c.LINK_STATUS),
                log: c.getProgramInfoLog(pg),
                activeAttributes: c.getProgramParameter(
                        pg,
                        c.ACTIVE_ATTRIBUTES
                ),
                activeUniforms: c.getProgramParameter(pg, c.ACTIVE_UNIFORMS),
        }
}

//  ユニフォームタイプの取得
export const getUniformType = (value: number | number[], isMatrix = false) => {
        let length = typeof value === 'number' ? 0 : value?.length
        if (!length) return `uniform1f`
        if (!isMatrix) return `uniform${length}fv`
        length = Math.sqrt(length) << 0
        return `uniformMatrix${length}fv`
}

// ユニフォーム位置を取得
export const getUniformLocation = (
        c: WebGLRenderingContext,
        pg: WebGLProgram,
        name: string
) => {
        return c.getUniformLocation(pg, name)
}

// アトリビュート位置を取得
export const getAttribLocation = (
        c: WebGLRenderingContext,
        pg: WebGLProgram,
        name: string
) => {
        return c.getAttribLocation(pg, name)
}
