import { importWasm, cancelVoxelizer } from '../utils'
import { generateRegionId } from './tiles'
import type { RegionConfig } from './tiles'
import type { BuiltState } from '../types'
import { encodeImagePNG } from '../world/atlas'

export type VoxelProcessorConfig = { defaultSize: number; cacheExpiry: number }

export type ProcessingResult = {
        success: boolean
        data?: BuiltState
        fromCache: boolean
        error?: string
}

const DEFAULT_CONFIG: VoxelProcessorConfig = { defaultSize: 16, cacheExpiry: 3600000 }

export const createVoxels = (config: Partial<VoxelProcessorConfig> = {}) => {
        const cfg = { ...DEFAULT_CONFIG, ...config }
        const processRegion = async (regionConfig: RegionConfig, tileData: ArrayBuffer): Promise<ProcessingResult> => {
                const { lat, lng, zoom } = regionConfig
                const size = cfg.defaultSize
                const cached = await retrieveFromCache(lat, lng, zoom, size)
                if (cached) return { success: true, data: cached, fromCache: true }
                const processed = await processWithWasm(tileData, size)
                if (processed.success && processed.data) await storeInCache(lat, lng, zoom, size, processed.data)
                return processed
        }
        const retrieveFromCache = async (lat: number, lng: number, zoom: number, _size: number): Promise<BuiltState | null> => {
                const url = `/api/v1/atlas?lat=${lat}&lng=${lng}&zoom=${zoom}`
                const chk = await fetch(url, { method: 'HEAD' })
                if (!chk.ok) return null
                const res = await fetch(url)
                if (!res.ok) return null
                const buf = new Uint8Array(await res.arrayBuffer())
                return { file: { key: 'atlas.png', data: buf, raw: buf, tag: generateRegionId({ lat, lng, zoom, bounds: { min: [], max: [] } }) }, dims: { size: [256, 256, 256], center: [128, 128, 128] } }
        }
        const storeInCache = async (lat: number, lng: number, zoom: number, _size: number, built: BuiltState): Promise<void> => {
                if (typeof built.file === 'string') return
                const png = await encodeImagePNG(built.file.raw!, 4096, 4096)
                await fetch(`/api/v1/atlas?lat=${lat}&lng=${lng}&zoom=${zoom}`, { method: 'PUT', body: png })
        }
        const processWithWasm = async (tileData: ArrayBuffer, size: number): Promise<ProcessingResult> => {
                const wasm = await importWasm()
                const parsed = await parseFromTiles(tileData)
                const items: any = await (wasm as any).voxelize_glb(parsed, size, size, size)
                const arr = Array.from(items || [])
                if (!arr.length) return { success: false, fromCache: false, error: 'empty' }
                const atlas = await combineVoxelChunks(arr, size)
                const built: BuiltState = { file: { key: 'atlas.png', data: atlas.data, raw: atlas.raw, tag: generateProcessingTag(tileData) }, dims: { size: [256, 256, 256], center: [128, 128, 128] } }
                return { success: true, data: built, fromCache: false }
        }
        const batchProcess = async (regions: RegionConfig[], tileDataMap: Map<string, ArrayBuffer>): Promise<Map<string, ProcessingResult>> => {
                const results = new Map<string, ProcessingResult>()
                const BATCH_SIZE = 3
                for (let i = 0; i < regions.length; i += BATCH_SIZE) {
                        const batch = regions.slice(i, i + BATCH_SIZE)
                        const promises: Promise<[string, ProcessingResult]>[] = batch.map(async (region) => {
                                const regionId = generateRegionId(region)
                                const tileData = tileDataMap.get(regionId)
                                if (!tileData) return [regionId, { success: false, fromCache: false, error: 'No tile data' } as ProcessingResult] as [string, ProcessingResult]
                                const result = await processRegion(region, tileData)
                                return [regionId, result] as [string, ProcessingResult]
                        })
                        const batchResults: [string, ProcessingResult][] = await Promise.all(promises)
                        for (const [id, result] of batchResults) results.set(id, result)
                }
                return results
        }
        const cleanup = async () => {
                await cancelVoxelizer()
        }
        return {
                processRegion,
                batchProcess,
                retrieveFromCache,
                cleanup,
        }
}

const parseFromTiles = async (_blob: ArrayBuffer): Promise<any> => ({ tris: [], materials: [], textures: [], aabb: { min: [0, 0, 0], max: [32, 16, 32] }, model: { extent: [32, 16, 32], center: [16, 8, 16] } })

const combineVoxelChunks = async (items: any[], _size: number): Promise<{ data: Uint8Array; raw: Uint8Array }> => {
        const atlas = new Uint8Array(4096 * 4096 * 4)
        for (const it of items) {
                const { key, rgba } = it as any
                const [ci, cj, ck] = String(key)
                        .split('.')
                        .map((v: string) => parseInt(v) | 0)
                const planeX = cj & 3
                const planeY = cj >> 2
                const ox = planeX * 1024 + ci * 64
                const oy = planeY * 1024 + ck * 64
                for (let y = 0; y < 64; y++) {
                        const dy = oy + y
                        const di = (dy * 4096 + ox) * 4
                        const si = y * 64 * 4
                        atlas.set(new Uint8Array(rgba).subarray(si, si + 64 * 4), di)
                }
        }
        return { data: atlas, raw: atlas }
}

const generateProcessingTag = (tileData: ArrayBuffer): string => {
        const hash = Array.from(new Uint8Array(tileData.slice(0, 32)))
                .map((b) => b.toString(16).padStart(2, '0'))
                .join('')
                .slice(0, 8)
        return `p${hash}`
}
