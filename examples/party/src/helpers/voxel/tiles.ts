import { loadGoogleMapsTiles } from '../tiles/loader'
import { createTileTraversal, selectTilesInRegion } from '../tiles/traversal'
import { importWasm } from '../utils'
import { parseGLBFromTiles, createGLBFromGeometry, combineVoxelChunksToAtlas } from './glb'
import type { Tileset, Tile } from '../tiles/loader'
import type { BuiltState } from '../types'
import type { Viewport } from '../tiles/traversal'

export type RegionConfig = {
        lat: number
        lng: number
        zoom: number
        bounds: { min: number[]; max: number[] }
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
                lastUpdated: Date.now(),
        }

        REGION_CACHE.set(regionId, region)
        return region
}

export const voxelizeRegionTiles = async (region: VoxelizedRegion, size: number = 16): Promise<BuiltState | null> => {
        if (!region.tiles.length) {
                return null
        }
        
        // Combine tiles into GLB format
        const combinedGLB = await combineTilesToGLB(region.tiles)
        if (!combinedGLB) return null
        
        // Import WASM voxelizer
        const wasm = await importWasm()
        
        // Parse GLB and extract geometry data from tiles
        const glbData = await parseGLBFromTiles(combinedGLB, region.config)
        
        // Voxelize the actual tile geometry
        const items = await (wasm as any).voxelize_glb(glbData, size, size, size)
        
        if (!items || items.length === 0) {
                return null
        }
        
        // Combine voxel chunks into world atlas
        const atlas = await combineVoxelChunksToAtlas(items, size)
        
        const builtState: BuiltState = {
                file: {
                        key: `region_${region.id}.png`,
                        data: atlas.data,
                        raw: atlas.raw,
                        tag: `tiles_${Date.now().toString(36)}`,
                },
                dims: {
                        size: [size * 16, size * 16, size * 16],
                        center: [size * 8, size * 8, size * 8],
                },
        }
        
        region.voxelData = builtState
        return builtState
}

export const combineTilesToGLB = async (tiles: Tile[]): Promise<ArrayBuffer | null> => {
        if (!tiles.length) return null

        // Extract geometry from tiles and combine into GLB
        const vertices: number[] = []
        const normals: number[] = []
        const indices: number[] = []
        
        let vertexOffset = 0
        
        for (const tile of tiles) {
                if (tile.content?.attributes?.positions?.value) {
                        const positions = tile.content.attributes.positions.value
                        const tileNormals = tile.content.attributes.normals?.value
                        
                        // Add vertices
                        for (let i = 0; i < positions.length; i++) {
                                vertices.push(positions[i])
                        }
                        
                        // Add normals if available
                        if (tileNormals) {
                                for (let i = 0; i < tileNormals.length; i++) {
                                        normals.push(tileNormals[i])
                                }
                        } else {
                                // Generate default normals
                                for (let i = 0; i < positions.length; i += 3) {
                                        normals.push(0, 1, 0) // Up normal
                                }
                        }
                        
                        // Generate indices for triangulation
                        const vertexCount = positions.length / 3
                        for (let i = 0; i < vertexCount; i += 3) {
                                indices.push(vertexOffset + i, vertexOffset + i + 1, vertexOffset + i + 2)
                        }
                        
                        vertexOffset += vertexCount
                }
        }
        
        // Create GLB buffer with actual geometry data
        return createGLBFromGeometry(vertices, normals, indices)
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

export const estimateRegionBounds = (lat: number, lng: number, zoom: number): { min: number[]; max: number[] } => {
        const tileSize = 256 / Math.pow(2, zoom)
        const halfSize = tileSize * 0.5

        return {
                min: [lng - halfSize, lat - halfSize, -100],
                max: [lng + halfSize, lat + halfSize, 100],
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

export const getRegionCacheStats = (): { count: number; totalTiles: number; memoryUsage: number } => {
        let totalTiles = 0
        let memoryUsage = 0

        for (const region of REGION_CACHE.values()) {
                totalTiles += region.tiles.length
                if (region.voxelData?.file && typeof region.voxelData.file !== 'string' && region.voxelData.file.data) {
                        memoryUsage += region.voxelData.file.data.byteLength
                }
        }

        return {
                count: REGION_CACHE.size,
                totalTiles,
                memoryUsage,
        }
}
