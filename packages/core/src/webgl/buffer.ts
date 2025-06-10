// WebGLバッファー作成と管理
export const createVbo = (
        c: WebGLRenderingContext,
        data: number[]
): WebGLBuffer => {
        const buffer = c.createBuffer()
        if (!buffer) throw new Error('Failed to create VBO')
        c.bindBuffer(c.ARRAY_BUFFER, buffer)
        c.bufferData(c.ARRAY_BUFFER, new Float32Array(data), c.STATIC_DRAW)
        c.bindBuffer(c.ARRAY_BUFFER, null)
        return buffer
}

// インデックスバッファーオブジェクト作成
export const createIbo = (
        c: WebGLRenderingContext,
        data: number[]
): WebGLBuffer => {
        const buffer = c.createBuffer()
        if (!buffer) throw new Error('Failed to create IBO')
        c.bindBuffer(c.ELEMENT_ARRAY_BUFFER, buffer)
        c.bufferData(
                c.ELEMENT_ARRAY_BUFFER,
                new Int16Array(data),
                c.STATIC_DRAW
        )
        c.bindBuffer(c.ELEMENT_ARRAY_BUFFER, null)
        return buffer
}

// アトリビュート設定
export const createAttribute = (
        c: WebGLRenderingContext,
        stride: number,
        location: number,
        vbo: WebGLBuffer,
        ibo?: WebGLBuffer
) => {
        c.bindBuffer(c.ARRAY_BUFFER, vbo)
        c.enableVertexAttribArray(location)
        c.vertexAttribPointer(location, stride, c.FLOAT, false, 0, 0)
        if (ibo) c.bindBuffer(c.ELEMENT_ARRAY_BUFFER, ibo)
}

// バッファーの削除
export const deleteBuffer = (c: WebGLRenderingContext, buffer: WebGLBuffer) => {
        c.deleteBuffer(buffer)
}

// 頂点ストライドを計算
export const vertexStride = (
        count: number,
        value: number[],
        iboValue?: number[]
) => {
        if (iboValue) count = Math.max(...iboValue) + 1
        const stride = value.length / count
        if (stride !== Math.floor(stride))
                console.warn(`Vertex Stride Error: count ${count} is mismatch`)
        return Math.floor(stride)
}

// バッファーデータの更新
export const updateVbo = (
        c: WebGLRenderingContext,
        buffer: WebGLBuffer,
        data: number[],
        usage = c.STATIC_DRAW
) => {
        c.bindBuffer(c.ARRAY_BUFFER, buffer)
        c.bufferData(c.ARRAY_BUFFER, new Float32Array(data), usage)
        c.bindBuffer(c.ARRAY_BUFFER, null)
}

export const updateIbo = (
        c: WebGLRenderingContext,
        buffer: WebGLBuffer,
        data: number[],
        usage = c.STATIC_DRAW
) => {
        c.bindBuffer(c.ELEMENT_ARRAY_BUFFER, buffer)
        c.bufferData(c.ELEMENT_ARRAY_BUFFER, new Int16Array(data), usage)
        c.bindBuffer(c.ELEMENT_ARRAY_BUFFER, null)
}
