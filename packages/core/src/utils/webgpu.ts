// WebGPUデバイス管理
export const requestWebGPUDevice = async (): Promise<{
        adapter: any // GPUAdapter @TODO FIX
        device: any // GPUDevice @TODO FIX
}> => {
        // @ts-ignore @TODO FIX
        if (!navigator.gpu) throw new Error('WebGPU is not supported in this browser')
        // @ts-ignore
        const adapter = await navigator.gpu.requestAdapter()
        if (!adapter) throw new Error('Failed to get WebGPU adapter')
        const device = await adapter.requestDevice()
        if (!device) throw new Error('Failed to get WebGPU device')
        return { adapter, device }
}

// デバイスエラーハンドリング
export const setupDeviceErrorHandling = (device: any) => {
        device.addEventListener('uncapturederror', (event: any) => {
                console.error('WebGPU uncaptured error:', event.error)
        })
}

// キャンバスコンテキストの設定
export const configureCanvasContext = (canvas: HTMLCanvasElement, device: any, format: any = 'bgra8unorm') => {
        const context = canvas.getContext('webgpu')
        if (!context) throw new Error('Failed to get WebGPU canvas context')

        // @ts-ignore
        context.configure({
                device,
                format,
                alphaMode: 'premultiplied',
        })

        return context
}

// デフォルトの頂点シェーダー
const defaultVertexShader = `
@vertex
fn main(@builtin(vertex_index) vertexIndex: u32) -> @builtin(position) vec4<f32> {
    var pos = array<vec2<f32>, 6>(
        vec2<f32>(-1.0, -1.0),
        vec2<f32>( 1.0, -1.0),
        vec2<f32>(-1.0,  1.0),
        vec2<f32>(-1.0,  1.0),
        vec2<f32>( 1.0, -1.0),
        vec2<f32>( 1.0,  1.0)
    );
    return vec4<f32>(pos[vertexIndex], 0.0, 1.0);
}
`

// デフォルトのフラグメントシェーダー
const defaultFragmentShader = `
@fragment
fn main() -> @location(0) vec4<f32> {
    return vec4<f32>(1.0, 0.0, 0.0, 1.0);
}
`

// WebGPUパイプライン管理
export const createRenderPipeline = (
        device: any,
        vertexShader = defaultVertexShader,
        fragmentShader = defaultFragmentShader,
        format = 'bgra8unorm'
) => {
        const v = device.createShaderModule({ code: vertexShader })
        const f = device.createShaderModule({ code: fragmentShader })
        return device.createRenderPipeline({
                layout: 'auto',
                vertex: {
                        module: v,
                        entryPoint: 'main',
                },
                fragment: {
                        module: f,
                        entryPoint: 'main',
                        targets: [
                                {
                                        format,
                                },
                        ],
                },
                primitive: {
                        topology: 'triangle-list',
                },
        })
}

// コンピュートパイプライン作成
export const createComputePipeline = (device: any, computeShader: string) => {
        const computeModule = device.createShaderModule({ code: computeShader })
        return device.createComputePipeline({
                layout: 'auto',
                compute: { module: computeModule, entryPoint: 'main' },
        })
}

// シェーダーモジュール作成
export const createShaderModule = (device: any, code: string) => {
        return device.createShaderModule({ code })
}

// バインドグループレイアウト作成
export const createBindGroupLayout = (device: any, entries: any[]) => {
        return device.createBindGroupLayout({ entries })
}

// バインドグループ作成
export const createBindGroup = (device: any, layout: any, entries: any[]) => {
        return device.createBindGroup({ layout, entries })
}

// レンダーパス作成
export const createRenderPass = (encoder: any, colorAttachment: any, depthStencilAttachment?: any) => {
        const descriptor: any = { colorAttachments: [colorAttachment] }
        if (depthStencilAttachment) descriptor.depthStencilAttachment = depthStencilAttachment
        return encoder.beginRenderPass(descriptor)
}

// コマンドエンコーダー作成
export const createCommandEncoder = (device: any) => {
        return device.createCommandEncoder()
}

import { is } from '../utils/helpers'

// WebGPUバッファー管理
export const createBuffer = (device: any, data: Float32Array | Uint32Array | number[], usage: number) => {
        const array = is.arr(data) ? new Float32Array(data) : data
        const buffer = device.createBuffer({
                size: array.byteLength,
                usage,
                mappedAtCreation: true,
        })
        if (array instanceof Float32Array) new Float32Array(buffer.getMappedRange()).set(array)
        else if (array instanceof Uint32Array) new Uint32Array(buffer.getMappedRange()).set(array)
        buffer.unmap()
        return buffer
}

// 頂点バッファー作成
export const createVertexBuffer = (device: any, data: number[]) => {
        return createBuffer(device, data, 0x20) // GPUBufferUsage.VERTEX
}

// インデックスバッファー作成
export const createIndexBuffer = (device: any, data: number[]) => {
        return createBuffer(device, new Uint32Array(data), 0x40) // GPUBufferUsage.INDEX
}

// ユニフォームバッファー作成
export const createUniformBuffer = (device: any, size: number) => {
        return device.createBuffer({
                size,
                usage: 0x40 | 0x4, // GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
                mappedAtCreation: false,
        })
}

// ストレージバッファー作成
export const createStorageBuffer = (device: any, size: number) => {
        return device.createBuffer({
                size,
                usage: 0x80 | 0x4, // GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST
                mappedAtCreation: false,
        })
}

// バッファーデータ更新
export const updateBuffer = (device: any, buffer: any, data: Float32Array | Uint32Array | number[], offset = 0) => {
        const array = is.arr(data) ? new Float32Array(data) : data
        device.queue.writeBuffer(buffer, offset, array)
}

// バッファーの削除
export const destroyBuffer = (buffer: any) => buffer.destroy()

// バッファーサイズの計算
export const calculateBufferSize = (data: number[]) => data.length * 4 // 4 bytes per float

// アライメント調整
export const alignBufferSize = (size: number, alignment = 256) => {
        return Math.ceil(size / alignment) * alignment
}

// 複数のバッファーを作成
export const createBuffers = (
        device: any,
        bufferConfigs: Array<{
                data: number[]
                usage: number
        }>
): any[] => {
        return bufferConfigs.map((config) => {
                return createBuffer(device, config.data, config.usage)
        })
}

// バッファー使用量の定数
export const BufferUsage = {
        VERTEX: 0x20,
        INDEX: 0x40,
        UNIFORM: 0x40,
        STORAGE: 0x80,
        COPY_SRC: 0x4,
        COPY_DST: 0x8,
        MAP_READ: 0x1,
        MAP_WRITE: 0x2,
} as const

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
export const createTextureFromImage = (device: any, image: HTMLImageElement | ImageBitmap, format = 'rgba8unorm') => {
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

// 深度テクスチャ作成
export const createDepthTexture = (device: any, w = 1280, h = 800, format = 'depth24plus') => {
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
export const updateTexture = (device: any, texture: any, data: Uint8Array | Uint8ClampedArray, w = 1280, h = 800) => {
        device.queue.writeTexture({ texture }, data, { bytesPerRow: w * 4 }, { width: w, height: h })
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
