import { loadGoogleMapsTiles, createMockGLBFromTile, estimateTileBounds } from '../tiles/loader'
import { createTileTraversal, selectTilesInRegion } from '../tiles/traversal'
import { buildChunk } from '../world/chunk'
import type { Tileset, Tile } from '../tiles/loader'
import type { Viewport } from '../tiles/traversal'
import type { BuiltState } from '../world/chunk'

export type RegionConfig = {
        lat: number
        lng: number
        zoom: number
        bounds: { min: number[], max: number[] }
        apiKey?: string
}

export type VoxelizedRegion = {
        id: string
        config: RegionConfig
        tileset: Tileset | null
        tiles: Tile[]
        voxelData: BuiltState | null
        lastUpdated: number
}

const REGION_CACHE = new Map<string, VoxelizedRegion>()

export const generateRegionId = (config: RegionConfig): string => {
        const { lat, lng, zoom } = config
        return `region_${lat.toFixed(4)}_${lng.toFixed(4)}_${zoom}`
}

export const loadRegionTiles = async (config: RegionConfig): Promise<VoxelizedRegion> => {
        const regionId = generateRegionId(config)
        
        if (REGION_CACHE.has(regionId)) {
                const cached = REGION_CACHE.get(regionId)!
                const isExpired = Date.now() - cached.lastUpdated > 3600000 // 1 hour
                if (!isExpired) return cached
        }
        
        const tileset = await loadGoogleMapsTiles(config.lat, config.lng, config.zoom, config.apiKey)
        const tiles = tileset ? selectTilesInRegion(tileset, config.bounds) : []
        
        const region: VoxelizedRegion = {
                id: regionId,
                config,
                tileset,
                tiles,
                voxelData: null,
                lastUpdated: Date.now()
        }
        
        REGION_CACHE.set(regionId, region)
        return region
}

export const voxelizeRegionTiles = async (region: VoxelizedRegion, size: number = 16): Promise<BuiltState | null> => {
        if (!region.tiles.length) return null
        
        const combinedGLB = await combineTilesToGLB(region.tiles)
        if (!combinedGLB) return null
        
        const voxelData = await buildChunk(combinedGLB, size)
        region.voxelData = voxelData
        region.lastUpdated = Date.now()
        
        return voxelData
}

export const combineTilesToGLB = async (tiles: Tile[]): Promise<ArrayBuffer | null> => {
        if (!tiles.length) return null
        
        let totalVertices = 0
        const tileBuffers: ArrayBuffer[] = []
        
        for (const tile of tiles) {
                const glb = createMockGLBFromTile(tile)
                if (glb) {
                        tileBuffers.push(glb)
                        if (tile.content?.vertexCount) {
                                totalVertices += tile.content.vertexCount
                        }
                }
        }
        
        if (!tileBuffers.length) return null
        
        const totalSize = tileBuffers.reduce((sum, buf) => sum + buf.byteLength, 0)
        const combined = new ArrayBuffer(totalSize + 1024) // Extra space for header
        const view = new Uint8Array(combined)
        
        // Simple GLB header
        const header = new Uint32Array(combined, 0, 3)
        header[0] = 0x46546c67 // 'glTF'
        header[1] = 2 // version
        header[2] = combined.byteLength // length
        
        let offset = 1024
        for (const buffer of tileBuffers) {
                view.set(new Uint8Array(buffer), offset)
                offset += buffer.byteLength
        }
        
        return combined
}

export const updateRegionVoxels = async (region: VoxelizedRegion, viewport: Viewport): Promise<Tile[]> => {
        if (!region.tileset) return []
        
        const traversal = createTileTraversal(region.tileset)
        const newTiles = await traversal.update(viewport)
        
        // Update region tiles if new tiles are available
        if (newTiles.length > 0) {
                region.tiles = newTiles
                region.lastUpdated = Date.now()
        }
        
        return newTiles
}

export const estimateRegionBounds = (lat: number, lng: number, zoom: number): { min: number[], max: number[] } => {
        const tileSize = 256 / Math.pow(2, zoom)
        const halfSize = tileSize * 0.5
        
        return {
                min: [lng - halfSize, lat - halfSize, -100],
                max: [lng + halfSize, lat + halfSize, 100]
        }
}

export const getCachedRegion = (config: RegionConfig): VoxelizedRegion | null => {
        const regionId = generateRegionId(config)
        return REGION_CACHE.get(regionId) || null
}

export const clearRegionCache = (maxAge: number = 3600000): void => {
        const now = Date.now()
        for (const [id, region] of REGION_CACHE.entries()) {
                if (now - region.lastUpdated > maxAge) {
                        REGION_CACHE.delete(id)
                }
        }
}

export const getRegionCacheStats = (): { count: number, totalTiles: number, memoryUsage: number } => {
        let totalTiles = 0
        let memoryUsage = 0
        
        for (const region of REGION_CACHE.values()) {
                totalTiles += region.tiles.length
                if (region.voxelData?.file?.data) {
                        memoryUsage += region.voxelData.file.data.byteLength
                }
        }
        
        return {
                count: REGION_CACHE.size,
                totalTiles,
                memoryUsage
        }
}