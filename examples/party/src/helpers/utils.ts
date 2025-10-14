import { vec3 } from 'gl-matrix'

/**
 * math
 */
export const chunk = (x = 0) => x >> 4 // div by 16 (world / CHUNK)
export const mod16 = (x = 0) => x & 15 // per by 16 (world % CHUNK)
export const clamp = (x = 0, a = 0, b = 1) => (x < a ? a : b < x ? b : x)
export const snap16 = (x = 0) => chunk(x + 8) << 4 // round to the nearest x16
export const chunkLevel = (x = 0) => clamp(chunk(x), 1, 16)

// per voxel
export const CHUNK = 16
export const SIZE = CHUNK * CHUNK * CHUNK
export const CUBE = vec3.fromValues(CHUNK, CHUNK, CHUNK)
export const ZERO = vec3.fromValues(0, 0, 0)
export const GRID = vec3.fromValues(16, 16, 16) // per chunk
export const WORLD = vec3.fromValues(GRID[0] * CHUNK, GRID[1] * CHUNK, GRID[2] * CHUNK) // per voxel

type EachFn<Value, Key, This> = (this: This, value: Value, key: Key) => void

type EachObj<Value = any, Key = any, This = any> = {
        forEach(f: EachFn<Value, Key, This>, ctx?: This): void
}

export const each = <T, K, This>(obj: EachObj<T, K, This>, f: EachFn<T, K, This>) => obj.forEach(f)

export const eachVoxel = (f: (x: number, y: number, z: number) => void) => {
        for (let z = 0; z < CHUNK; z++) for (let y = 0; y < CHUNK; y++) for (let x = 0; x < CHUNK; x++) f(x, y, z)
}

export const eachChunk = (f: (i: number, j: number, k: number) => void) => {
        for (let k = 0; k < GRID[2]; k++) for (let j = 0; j < GRID[1]; j++) for (let i = 0; i < GRID[0]; i++) f(i, j, k)
}

export const eachAxis = (f: (axis: number) => void) => {
        for (let axis = 0; axis < 3; axis++) f(axis)
}

export const chunkId = (i = 0, j = 0, k = 0) => i + j * GRID[0] + k * GRID[1] * GRID[2]
export const localId = (x = 0, y = 0, z = 0) => x + (y + z * CHUNK) * CHUNK
export const located = (X = 0, Y = 0, Z = 0) => {
        const i = chunk(X)
        const j = chunk(Y)
        const k = chunk(Z)
        const x = mod16(X)
        const y = mod16(Y)
        const z = mod16(Z)
        let _local: vec3
        let _chunk: vec3
        let _chunkId: number
        let _localId: number
        return {
                get local() {
                        return _local ?? (_local = vec3.fromValues(x, y, z))
                },
                get chunk() {
                        return _chunk ?? (_chunk = vec3.fromValues(i, j, k))
                },
                get chunkId() {
                        return _chunkId ?? (_chunkId = chunkId(i, j, k))
                },
                get localId() {
                        return _localId ?? (_localId = localId(x, y, z))
                },
        }
}

export const importWasm = async () => {
        const wasm: any = await import('../../voxelizer/pkg/voxelizer')
        await wasm.default()
        return wasm
}

export const cancelVoxelizer = async () => {
        const wasm = await importWasm()
        if ((wasm as any).cancel) (wasm as any).cancel()
}

/**
 * ↓↓↓　DO NOT USE timer function ↓↓↓
 */
export function timer<Fn extends (...args: any[]) => any>(label: string, fn: Fn): Fn {
        const wrapped = async (...args: Parameters<Fn>): Promise<ReturnType<Fn>> => {
                const now = () => (globalThis.performance?.now ? globalThis.performance.now() : Date.now())
                const start = now()
                try {
                        return await fn(...args)
                } finally {
                        const end = now()
                        // eslint-disable-next-line no-console
                        console.log(`[timer] ${label}: ${(end - start).toFixed(1)}ms`)
                }
        }
        // cast back to original type to preserve call signature
        return wrapped as unknown as Fn
}
