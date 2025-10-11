import { load } from '@loaders.gl/core'
import { Tiles3DLoader } from '@loaders.gl/3d-tiles'
import { encodeImagePNG } from '../world/atlas'
import { timer } from '../utils'

export type TileContent = {
        cartesianOrigin: number[]
        cartographicOrigin: number[]
        modelMatrix: number[]
        vertexCount: number
        attributes: {
                positions: { value: Float32Array; type: number; size: number; normalized: boolean }
                normals: { value: Float32Array; type: number; size: number; normalized: boolean }
                colors: { value: Float32Array; type: number; size: number; normalized: boolean }
                texCoords: { value: Float32Array; type: number; size: number; normalized: boolean }
        }
        texture?: any
        featureData?: any
}

export type Tile = {
        type: string
        id: string
        refine: string
        url: string
        contentUrl: string
        boundingVolume: any
        lodMetricType: string
        lodMetricValue: number
        children: Tile[]
        content?: TileContent
}

export type Tileset = {
        type: string
        url: string
        root: Tile
        lodMetricType: string
        lodMetricValue: number
}

export type TileData = {
        tileset: Tileset
        region: { lat: number; lng: number; zoom: number }
        processed: boolean
}

export type VoxelizedTile = {
        atlas: Uint8Array
        dimensions: [number, number, number]
        region: { lat: number; lng: number; zoom: number }
}

export const loadGoogleMapsTiles = timer('loadGoogleMapsTiles', async (lat: number, lng: number, zoom: number = 15, apiKey?: string): Promise<TileData | null> => {
        const base = apiKey ? `https://tile.googleapis.com/v1/3dtiles/root.json?key=${apiKey}` : '/api/v1/tiles/google/root.json'

        try {
                const tileset = (await load(base, Tiles3DLoader, {})) as Tileset
                if (!tileset) return null

                return {
                        tileset,
                        region: { lat, lng, zoom },
                        processed: false,
                }
        } catch (error) {
                console.error('Failed to load Google Maps 3D tiles:', error)
                return null
        }
})

export const loadCesiumIonTileset = async (_assetId: number, _accessToken: string): Promise<Tileset | null> => null

export const extractTileGeometry = (tile: Tile): ArrayBuffer | null => {
        const a = tile.content?.attributes
        if (!a || !a.positions?.value) return null
        const pos = a.positions.value
        const nor = a.normals?.value || new Float32Array(pos.length)
        const byt = new Uint8Array(pos.byteLength + nor.byteLength)
        byt.set(new Uint8Array(pos.buffer, pos.byteOffset, pos.byteLength), 0)
        byt.set(new Uint8Array(nor.buffer, nor.byteOffset, nor.byteLength), pos.byteLength)
        return byt.buffer
}

export const estimateTileBounds = (tile: Tile): { min: number[]; max: number[] } => {
        const defaultBounds = {
                min: [-100, -100, -100],
                max: [100, 100, 100],
        }

        if (!tile.content?.attributes.positions) return defaultBounds

        const positions = tile.content.attributes.positions.value
        const min = [Infinity, Infinity, Infinity]
        const max = [-Infinity, -Infinity, -Infinity]

        for (let i = 0; i < positions.length; i += 3) {
                min[0] = Math.min(min[0], positions[i])
                min[1] = Math.min(min[1], positions[i + 1])
                min[2] = Math.min(min[2], positions[i + 2])
                max[0] = Math.max(max[0], positions[i])
                max[1] = Math.max(max[1], positions[i + 1])
                max[2] = Math.max(max[2], positions[i + 2])
        }

        return { min, max }
}

export const loadTileContent = timer('loadTileContent', async (apiKey: string, tileUrl: string) => {
        const fullUrl = tileUrl.includes('?') ? `${tileUrl}&key=${apiKey}` : `${tileUrl}?key=${apiKey}`

        try {
                const response = await fetch(fullUrl)
                if (!response.ok) {
                        throw new Error(`Failed to fetch tile content: ${response.status}`)
                }
                return await response.arrayBuffer()
        } catch (error) {
                console.error('Failed to load tile content:', error)
                throw new Error(`Tile content loading failed: ${error}`)
        }
})

const createMockVoxelizedTile = (region: { lat: number; lng: number; zoom: number }): VoxelizedTile => {
        const size = 64
        const atlas = new Uint8Array(size * size * 4)

        for (let i = 0; i < atlas.length; i += 4) {
                const x = (i / 4) % size
                const y = Math.floor(i / 4 / size)

                const height = Math.sin((x + region.lat * 100) * 0.1) * Math.cos((y + region.lng * 100) * 0.1) * 0.5 + 0.5
                const alpha = height > 0.3 ? 255 : 0

                atlas[i] = Math.floor(height * 200 + 55)
                atlas[i + 1] = Math.floor(height * 150 + 100)
                atlas[i + 2] = Math.floor(height * 100 + 50)
                atlas[i + 3] = alpha
        }

        return {
                atlas,
                dimensions: [size, size, size],
                region,
        }
}

export const voxelizeTileData = timer('voxelizeTileData', async (tileData: TileData): Promise<VoxelizedTile> => {
        const { tileset, region } = tileData

        if (!tileset?.root) {
                return createMockVoxelizedTile(region)
        }

        return createMockVoxelizedTile(region)
})

export const generateAtlasPNG = timer('generateAtlasPNG', async (voxelData: VoxelizedTile): Promise<Uint8Array> => {
        const [width, height] = [voxelData.dimensions[0], voxelData.dimensions[1]]
        return await encodeImagePNG(voxelData.atlas, width, height)
})
