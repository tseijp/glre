import { load } from '@loaders.gl/core'
import { Tiles3DLoader } from '@loaders.gl/3d-tiles'
import { CesiumIonLoader } from '@loaders.gl/3d-tiles'

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
        const tilesetUrl = `https://tile.googleapis.com/v1/3dtiles/root.json?session=${key}&key=${key}`
        
        try {
                const tileset = await load(tilesetUrl, Tiles3DLoader, {
                        '3d-tiles': {
                                loadGLTF: true,
                                loadBuffers: true,
                                isTileset: true,
                                asynchronous: true
                        }
                }) as Tileset
                
                return tileset
        } catch (error) {
                return null
        }
}

export const loadCesiumIonTileset = async (assetId: number, accessToken: string): Promise<Tileset | null> => {
        try {
                const tileset = await load(assetId, CesiumIonLoader, {
                        'cesium-ion': { accessToken },
                        '3d-tiles': {
                                loadGLTF: true,
                                loadBuffers: true,
                                isTileset: true
                        }
                }) as Tileset
                
                return tileset
        } catch (error) {
                return null
        }
}

export const extractTileGeometry = (tile: Tile): ArrayBuffer | null => {
        if (!tile.content) return null
        
        const { attributes } = tile.content
        if (!attributes.positions?.value) return null
        
        const positions = attributes.positions.value
        const normals = attributes.normals?.value || new Float32Array(positions.length).fill(0)
        const texCoords = attributes.texCoords?.value || new Float32Array((positions.length / 3) * 2).fill(0)
        
        const totalSize = positions.byteLength + normals.byteLength + texCoords.byteLength
        const buffer = new ArrayBuffer(totalSize)
        const view = new Uint8Array(buffer)
        
        let offset = 0
        view.set(new Uint8Array(positions.buffer), offset)
        offset += positions.byteLength
        view.set(new Uint8Array(normals.buffer), offset)
        offset += normals.byteLength
        view.set(new Uint8Array(texCoords.buffer), offset)
        
        return buffer
}

export const createMockGLBFromTile = (tile: Tile): ArrayBuffer | null => {
        if (!tile.content?.attributes.positions) return null
        
        const positions = tile.content.attributes.positions.value
        const vertexCount = positions.length / 3
        
        const mockGLB = new ArrayBuffer(1024 + positions.byteLength)
        const header = new Uint32Array(mockGLB, 0, 3)
        header[0] = 0x46546c67 // 'glTF'
        header[1] = 2 // version
        header[2] = mockGLB.byteLength // length
        
        const positionsView = new Float32Array(mockGLB, 1024, positions.length)
        positionsView.set(positions)
        
        return mockGLB
}

export const estimateTileBounds = (tile: Tile): { min: number[], max: number[] } => {
        const defaultBounds = {
                min: [-100, -100, -100],
                max: [100, 100, 100]
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