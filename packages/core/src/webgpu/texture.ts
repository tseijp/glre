// WebGPUテクスチャ管理
const createTexture = (
        device: any,
        w = 1280,
        h = 800,
        format = 'rgba8unorm',
        usage = 0x14 // GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST
) => {
        return device.createTexture({
                size: { width: w, height: h, depthOrArrayLayers: 1 },
                format,
                usage,
        })
}

// 画像からテクスチャ作成
export const createTextureFromImage = (
        device: any,
        image: HTMLImageElement | ImageBitmap,
        format = 'rgba8unorm'
) => {
        const texture = createTexture(
                device,
                image.width,
                image.height,
                format,
                0x14 | 0x4 // TEXTURE_BINDING | COPY_DST
        )

        device.queue.copyExternalImageToTexture(
                { source: image },
                { texture },
                { width: image.width, height: image.height }
        )

        return texture
}

// キューブマップテクスチャ作成
const createCubeTexture = (
        device: any,
        size: number,
        format = 'rgba8unorm'
) => {
        return device.createTexture({
                size: { width: size, height: size, depthOrArrayLayers: 6 },
                format,
                usage: 0x14, // GPUTextureUsage.TEXTURE_BINDING
                dimension: '2d',
        })
}

// 深度テクスチャ作成
export const createDepthTexture = (
        device: any,
        w = 1280,
        h = 800,
        format = 'depth24plus'
) => {
        return device.createTexture({
                size: { width: w, height: h, depthOrArrayLayers: 1 },
                format,
                usage: 0x10, // GPUTextureUsage.RENDER_ATTACHMENT
        })
}

// サンプラー作成
export const createSampler = (
        device: any,
        options: {
                magFilter?: string
                minFilter?: string
                addressModeU?: string
                addressModeV?: string
                addressModeW?: string
        } = {}
) => {
        return device.createSampler({
                magFilter: options.magFilter || 'linear',
                minFilter: options.minFilter || 'linear',
                addressModeU: options.addressModeU || 'repeat',
                addressModeV: options.addressModeV || 'repeat',
                addressModeW: options.addressModeW || 'repeat',
        })
}

// テクスチャビュー作成
export const createTextureView = (
        texture: any,
        options: {
                format?: string
                dimension?: string
                aspect?: string
                baseMipLevel?: number
                mipLevelCount?: number
                baseArrayLayer?: number
                arrayLayerCount?: number
        } = {}
) => {
        return texture.createView(options)
}

// テクスチャデータ更新
export const updateTexture = (
        device: any,
        texture: any,
        data: Uint8Array | Uint8ClampedArray,
        w = 1280,
        h = 800
) => {
        device.queue.writeTexture(
                { texture },
                data,
                { bytesPerRow: w * 4 },
                { width: w, height: h }
        )
}

// テクスチャの削除
export const destroyTexture = (texture: any) => texture.destroy()

// テクスチャ使用量の定数
export const TextureUsage = {
        COPY_SRC: 0x1,
        COPY_DST: 0x2,
        TEXTURE_BINDING: 0x4,
        STORAGE_BINDING: 0x8,
        RENDER_ATTACHMENT: 0x10,
} as const

// テクスチャフォーマットの定数
export const TextureFormat = {
        RGBA8_UNORM: 'rgba8unorm',
        RGBA8_SRGB: 'rgba8unorm-srgb',
        BGRA8_UNORM: 'bgra8unorm',
        BGRA8_SRGB: 'bgra8unorm-srgb',
        DEPTH24_PLUS: 'depth24plus',
        DEPTH32_FLOAT: 'depth32float',
} as const
