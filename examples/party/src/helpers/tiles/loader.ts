import { load } from '@loaders.gl/core'
import { Tiles3DLoader } from '@loaders.gl/3d-tiles'

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

const DEFAULT_GOOGLE_MAPS_KEY = 'YOUR_GOOGLE_MAPS_API_KEY'

export const loadGoogleMapsTiles = async (lat: number, lng: number, zoom: number = 15, apiKey?: string): Promise<Tileset | null> => {
        const key = apiKey || DEFAULT_GOOGLE_MAPS_KEY
        const tilesetUrl = `https://tile.googleapis.com/v1/3dtiles/root.json?key=${key}`
        const tileset = (await load(tilesetUrl, Tiles3DLoader, { '3d-tiles': { isTileset: true } })) as Tileset
        return tileset || null
}

export const loadCesiumIonTileset = async (_assetId: number, _accessToken: string): Promise<Tileset | null> => null

export const extractTileGeometry = (_tile: Tile): ArrayBuffer | null => null

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
