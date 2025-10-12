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

export type VoxelizedTile = {
        atlas: Uint8Array
        dimensions: [number, number, number]
        region: { lat: number; lng: number; zoom: number }
}

export const loadCesiumModel = async (assetId: number, client?: any): Promise<ArrayBuffer | null> => {
        if (!client) return null
        const res = await client.api.v1.cesium[':assetId'].$get({ param: { assetId: String(assetId) } })
        if (!res.ok) return null
        const ct = (res.headers.get && res.headers.get('content-type')) || ''
        return await res.arrayBuffer()
}

const createVoxelizedTile = (_region: { lat: number; lng: number; zoom: number }, gltfData?: ArrayBuffer): VoxelizedTile => {
        const size = 64
        const atlas = new Uint8Array(size * size * 4)
        if (!gltfData) return { atlas, dimensions: [size, size, size], region: _region }
        atlas.fill(0)
        return {
                atlas,
                dimensions: [size, size, size],
                region: _region,
        }
}

export const voxelizeCesiumData = async (assetId: number, region: { lat: number; lng: number; zoom: number }, client?: any): Promise<VoxelizedTile> => {
        const gltfData = await loadCesiumModel(assetId, client)
        if (gltfData) return createVoxelizedTile(region, gltfData)
        return createVoxelizedTile(region)
}
