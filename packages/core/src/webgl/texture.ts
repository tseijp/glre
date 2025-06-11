// WebGLテクスチャ作成と管理
export const createTexture = (
        c: WebGLRenderingContext,
        img: HTMLImageElement
) => {
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

// テクスチャユニットをアクティブ化
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

// テクスチャの削除
export const deleteTexture = (
        c: WebGLRenderingContext,
        texture: WebGLTexture
) => {
        c.deleteTexture(texture)
}

// 空のテクスチャを作成
export const createEmptyTexture = (
        c: WebGLRenderingContext,
        w = 1280,
        h = 800,
        format = c.RGBA,
        type = c.UNSIGNED_BYTE
) => {
        const texture = c.createTexture()
        if (!texture) throw new Error('Failed to create empty texture')
        c.bindTexture(c.TEXTURE_2D, texture)
        // prettier-ignore
        c.texImage2D(c.TEXTURE_2D, 0, format, w, h, 0, format, type, null)
        c.texParameteri(c.TEXTURE_2D, c.TEXTURE_MIN_FILTER, c.LINEAR)
        c.texParameteri(c.TEXTURE_2D, c.TEXTURE_MAG_FILTER, c.LINEAR)
        c.texParameteri(c.TEXTURE_2D, c.TEXTURE_WRAP_S, c.CLAMP_TO_EDGE)
        c.texParameteri(c.TEXTURE_2D, c.TEXTURE_WRAP_T, c.CLAMP_TO_EDGE)
        c.bindTexture(c.TEXTURE_2D, null)
        return texture
}

// キューブマップテクスチャを作成
export const createCubeTexture = (
        c: WebGLRenderingContext,
        imgs: HTMLImageElement[]
) => {
        if (imgs.length !== 6)
                throw new Error('Cube texture requires exactly 6 imgs')
        const texture = c.createTexture()
        if (!texture) throw new Error('Failed to create cube texture')
        c.bindTexture(c.TEXTURE_CUBE_MAP, texture)
        const faces = [
                c.TEXTURE_CUBE_MAP_POSITIVE_X,
                c.TEXTURE_CUBE_MAP_NEGATIVE_X,
                c.TEXTURE_CUBE_MAP_POSITIVE_Y,
                c.TEXTURE_CUBE_MAP_NEGATIVE_Y,
                c.TEXTURE_CUBE_MAP_POSITIVE_Z,
                c.TEXTURE_CUBE_MAP_NEGATIVE_Z,
        ]
        // prettier-ignore
        faces.forEach((face, index) => {
                c.texImage2D( face, 0, c.RGBA, c.RGBA, c.UNSIGNED_BYTE, imgs[index])
        })
        c.generateMipmap(c.TEXTURE_CUBE_MAP)
        // prettier-ignore
        c.texParameteri(c.TEXTURE_CUBE_MAP, c.TEXTURE_MIN_FILTER, c.LINEAR_MIPMAP_LINEAR)
        c.texParameteri(c.TEXTURE_CUBE_MAP, c.TEXTURE_MAG_FILTER, c.LINEAR)
        c.texParameteri(c.TEXTURE_CUBE_MAP, c.TEXTURE_WRAP_S, c.CLAMP_TO_EDGE)
        c.texParameteri(c.TEXTURE_CUBE_MAP, c.TEXTURE_WRAP_T, c.CLAMP_TO_EDGE)

        c.bindTexture(c.TEXTURE_CUBE_MAP, null)

        return texture
}
