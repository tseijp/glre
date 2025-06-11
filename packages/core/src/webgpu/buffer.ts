import { is } from '../utils'

// WebGPUバッファー管理
export const createBuffer = (
        device: any,
        data: Float32Array | Uint32Array | number[],
        usage: number
) => {
        const array = is.arr(data) ? new Float32Array(data) : data
        const buffer = device.createBuffer({
                size: array.byteLength,
                usage,
                mappedAtCreation: true,
        })
        if (array instanceof Float32Array)
                new Float32Array(buffer.getMappedRange()).set(array)
        else if (array instanceof Uint32Array)
                new Uint32Array(buffer.getMappedRange()).set(array)
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
export const updateBuffer = (
        device: any,
        buffer: any,
        data: Float32Array | Uint32Array | number[],
        offset = 0
) => {
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
