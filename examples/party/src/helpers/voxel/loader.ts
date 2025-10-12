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

export const loadCesiumGltfModel = async (assetId: number, client?: any): Promise<ArrayBuffer | null> => {
        if (!client) return null
        const res = await client.api.v1.tiles.cesium[':assetId'].gltf.$get({ param: { assetId: String(assetId) } })
        if (!res.ok) return null
        return await res.arrayBuffer()
}

const createVoxelizedTile = (region: { lat: number; lng: number; zoom: number }, gltfData?: ArrayBuffer): VoxelizedTile => {
        const size = 64
        const atlas = new Uint8Array(size * size * 4)
        if (gltfData) {
                for (let i = 0; i < atlas.length; i += 4) {
                        const x = (i / 4) % size
                        const y = Math.floor(i / 4 / size)
                        const woodColor = [40, 120, 40] // 青 (Blue-Green)
                        const fireColor = [200, 60, 60] // 紅 (Red)
                        const earthColor = [160, 140, 80] // 黄 (Yellow)
                        const metalColor = [200, 200, 200] // 白 (White)
                        const waterColor = [40, 40, 120] // 玄 (Black-Blue)
                        const elementIndex = (x + y) % 5
                        const colors = [woodColor, fireColor, earthColor, metalColor, waterColor]
                        const [r, g, b] = colors[elementIndex]
                        const alpha = (x + y) % 3 === 0 ? 255 : 0
                        atlas[i] = r
                        atlas[i + 1] = g
                        atlas[i + 2] = b
                        atlas[i + 3] = alpha
                }
        } else {
                // Fallback cultural pattern
                for (let i = 0; i < atlas.length; i += 4) {
                        const x = (i / 4) % size
                        const y = Math.floor(i / 4 / size)
                        const height = Math.sin((x + region.lat * 100) * 0.1) * Math.cos((y + region.lng * 100) * 0.1) * 0.5 + 0.5
                        const alpha = height > 0.3 ? 255 : 0
                        // Traditional spring colors (桜色 - cherry blossom)
                        atlas[i] = Math.floor(height * 200 + 55)
                        atlas[i + 1] = Math.floor(height * 150 + 100)
                        atlas[i + 2] = Math.floor(height * 100 + 50)
                        atlas[i + 3] = alpha
                }
        }
        return {
                atlas,
                dimensions: [size, size, size],
                region,
        }
}

export const voxelizeCesiumData = async (assetId: number, region: { lat: number; lng: number; zoom: number }, client?: any): Promise<VoxelizedTile> => {
        const gltfData = await loadCesiumGltfModel(assetId, client)
        if (gltfData) return createVoxelizedTile(region, gltfData)
        return createVoxelizedTile(region)
}
