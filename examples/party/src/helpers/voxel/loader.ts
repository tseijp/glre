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
        const gltf = await client.api.v1.tiles.cesium[':assetId'].gltf.$get({ param: { assetId: String(assetId) } })
        if (!gltf.ok) return null
        const ct = (gltf.headers.get && gltf.headers.get('content-type')) || ''
        if (ct.includes('gltf') || ct.includes('model/gltf-binary')) return await gltf.arrayBuffer()
        const isJson = ct.includes('json')
        if (!isJson) return await gltf.arrayBuffer()
        const ts = await client.api.v1.tiles.cesium[':assetId'].tileset.$get({ param: { assetId: String(assetId) } })
        if (!ts.ok) return null
        const meta = (await ts.json()) as any
        const tileset: any = meta.tileset || {}
        const q: any[] = []
        const root = tileset.root || {}
        q.push(root)
        let path = ''
        while (q.length) {
                const t = q.shift()
                const c = t?.content || {}
                const uri = c.uri || c.url || ''
                if (uri && (uri.endsWith('.b3dm') || uri.endsWith('.i3dm') || uri.endsWith('.glb'))) {
                        path = uri
                        break
                }
                const ch = t?.children || []
                for (let i = 0; i < ch.length; i++) q.push(ch[i])
        }
        if (!path) return null
        const tile = await client.api.v1.tiles.cesium[':assetId'].tile.$post({ param: { assetId: String(assetId) }, json: { path } })
        if (!tile.ok) return null
        return await tile.arrayBuffer()
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
        const gltfData = await loadCesiumGltfModel(assetId, client)
        if (gltfData) return createVoxelizedTile(region, gltfData)
        return createVoxelizedTile(region)
}
