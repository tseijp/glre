import { importWasm, cancelVoxelizer } from '../utils'
import { createR2Client, storeVoxelData, retrieveVoxelData, checkVoxelExists } from '../storage/r2'
import { generateRegionId } from './tiles'
import type { RegionConfig } from './tiles'
import type { StoredVoxelData, R2StorageConfig } from '../storage/r2'
import type { BuiltState, FileData } from '../types'

export type VoxelProcessorConfig = {
        r2Config: R2StorageConfig
        defaultSize: number
        cacheExpiry: number
}

export type ProcessingResult = {
        success: boolean
        data?: BuiltState
        fromCache: boolean
        error?: string
}

const DEFAULT_CONFIG: VoxelProcessorConfig = {
        r2Config: {
                accountId: process.env.CLOUDFLARE_ACCOUNT_ID || '',
                accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
                secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
                bucketName: process.env.R2_BUCKET_NAME || 'voxel-cache'
        },
        defaultSize: 16,
        cacheExpiry: 3600000 // 1 hour
}

export const createVoxelProcessor = (config: Partial<VoxelProcessorConfig> = {}) => {
        const cfg = { ...DEFAULT_CONFIG, ...config }
        const r2 = createR2Client(cfg.r2Config)
        
        const processRegion = async (regionConfig: RegionConfig, tileData: ArrayBuffer): Promise<ProcessingResult> => {
                const { lat, lng, zoom } = regionConfig
                const size = cfg.defaultSize
                
                // Check R2 cache first
                const cached = await retrieveFromCache(lat, lng, zoom, size)
                if (cached) {
                        return {
                                success: true,
                                data: cached,
                                fromCache: true
                        }
                }
                
                // Process with WASM if not cached
                const processed = await processWithWasm(tileData, size)
                if (processed.success && processed.data) {
                        // Store in R2 cache
                        await storeInCache(lat, lng, zoom, size, processed.data)
                }
                
                return processed
        }
        
        const retrieveFromCache = async (lat: number, lng: number, zoom: number, size: number): Promise<BuiltState | null> => {
                const exists = await checkVoxelExists(r2, lat, lng, zoom, size)
                if (!exists) return null
                
                const stored = await retrieveVoxelData(r2, lat, lng, zoom, size)
                if (!stored) return null
                
                // Check if cache is still valid
                if (Date.now() - stored.metadata.createdAt > cfg.cacheExpiry) {
                        return null
                }
                
                // Convert stored data back to BuiltState
                return convertStoredToBuiltState(stored)
        }
        
        const storeInCache = async (lat: number, lng: number, zoom: number, size: number, builtState: BuiltState): Promise<void> => {
                if (typeof builtState.file === 'string') return
                
                const storedData: StoredVoxelData = {
                        id: generateRegionId({ lat, lng, zoom, bounds: { min: [], max: [] } }),
                        region: `${lat.toFixed(4)}_${lng.toFixed(4)}`,
                        data: builtState.file.data,
                        metadata: {
                                lat,
                                lng,
                                zoom,
                                size: builtState.dims.size,
                                createdAt: Date.now(),
                                lastAccessed: Date.now()
                        }
                }
                
                await storeVoxelData(r2, storedData)
        }
        
        const processWithWasm = async (tileData: ArrayBuffer, size: number): Promise<ProcessingResult> => {
                const wasm = await importWasm()
                
                const glb = await parseGLBFromTiles(tileData)
                if (!glb) {
                        return {
                                success: false,
                                fromCache: false,
                                error: 'Failed to parse GLB from tile data'
                        }
                }
                
                const items = await wasm.voxelize_glb(glb, size, size, size)
                if (!items || items.length === 0) {
                        return {
                                success: false,
                                fromCache: false,
                                error: 'Voxelization failed'
                        }
                }
                
                // Combine voxel chunks into atlas
                const atlas = await combineVoxelChunks(items, size)
                const dims = estimateVoxelDimensions(glb, size)
                
                const builtState: BuiltState = {
                        file: {
                                key: 'processed.png',
                                data: atlas.data,
                                raw: atlas.raw,
                                tag: generateProcessingTag(tileData)
                        },
                        dims
                }
                
                return {
                        success: true,
                        data: builtState,
                        fromCache: false
                }
        }
        
        const batchProcess = async (regions: RegionConfig[], tileDataMap: Map<string, ArrayBuffer>): Promise<Map<string, ProcessingResult>> => {
                const results = new Map<string, ProcessingResult>()
                
                // Process regions in parallel with limit
                const BATCH_SIZE = 3
                for (let i = 0; i < regions.length; i += BATCH_SIZE) {
                        const batch = regions.slice(i, i + BATCH_SIZE)
                        const promises = batch.map(async (region) => {
                                const regionId = generateRegionId(region)
                                const tileData = tileDataMap.get(regionId)
                                
                                if (!tileData) {
                                        return [regionId, { success: false, fromCache: false, error: 'No tile data' }]
                                }
                                
                                const result = await processRegion(region, tileData)
                                return [regionId, result]
                        })
                        
                        const batchResults = await Promise.all(promises)
                        for (const [id, result] of batchResults) {
                                results.set(id, result)
                        }
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
                cleanup
        }
}

const parseGLBFromTiles = async (tileData: ArrayBuffer): Promise<any> => {
        // Simple GLB header validation
        const header = new Uint32Array(tileData, 0, 3)
        if (header[0] !== 0x46546c67) return null // 'glTF'
        
        // Return simplified GLB structure for voxelizer
        return {
                tris: [],
                materials: [],
                textures: [],
                aabb: { min: [-10, -10, -10], max: [10, 10, 10] },
                model: { extent: [20, 20, 20], center: [0, 0, 0] }
        }
}

const combineVoxelChunks = async (items: any[], size: number): Promise<{ data: Uint8Array, raw: Uint8Array }> => {
        const totalSize = size * 64 * size * 64 * 4
        const atlas = new Uint8Array(totalSize)
        
        for (const item of items) {
                // Combine chunk data into atlas
                atlas.set(item.rgba || new Uint8Array(64 * 64 * 4))
        }
        
        return { data: atlas, raw: atlas }
}

const estimateVoxelDimensions = (glb: any, size: number) => {
        const extent = glb.model?.extent || [size, size, size]
        return {
                size: extent,
                center: [extent[0] * 0.5, extent[1] * 0.5, extent[2] * 0.5]
        }
}

const generateProcessingTag = (tileData: ArrayBuffer): string => {
        const hash = Array.from(new Uint8Array(tileData.slice(0, 32)))
                .map(b => b.toString(16).padStart(2, '0'))
                .join('')
                .slice(0, 8)
        return `p${hash}`
}

const convertStoredToBuiltState = (stored: StoredVoxelData): BuiltState => {
        return {
                file: {
                        key: stored.id,
                        data: stored.data,
                        raw: stored.data,
                        tag: stored.region
                },
                dims: {
                        size: stored.metadata.size,
                        center: [
                                stored.metadata.size[0] * 0.5,
                                stored.metadata.size[1] * 0.5,
                                stored.metadata.size[2] * 0.5
                        ]
                }
        }
}