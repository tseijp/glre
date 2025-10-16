import { Tile3DLayer } from '@deck.gl/geo-layers'
import { Tiles3DLoader } from '@loaders.gl/3d-tiles'

export type GoogleTile3DOptions = {
        rx: number
        rz: number
        apiKey?: string
}

export type GoogleRegionData = {
        lat: number
        lng: number
        zoom: number
        tiles: any[]
        boundingBox: {
                minLat: number
                maxLat: number
                minLng: number
                maxLng: number
        }
}

const METERS_PER_REGION = 256
const EARTH_RADIUS = 6371000
const ORIGIN_LAT = 35.6762 // Tokyo as origin point
const ORIGIN_LNG = 139.6503

const metersToLatLng = (rx: number, rz: number) => {
        const deltaX = rx * METERS_PER_REGION
        const deltaZ = rz * METERS_PER_REGION
        const deltaLat = (deltaZ / EARTH_RADIUS) * (180 / Math.PI)
        const deltaLng = (deltaX / EARTH_RADIUS) * (180 / Math.PI) / Math.cos((ORIGIN_LAT * Math.PI) / 180)
        return { 
                lat: ORIGIN_LAT + deltaLat, 
                lng: ORIGIN_LNG + deltaLng 
        }
}

export const calculateRegionLatLng = (rx: number, rz: number) => metersToLatLng(rx, rz)

const calculateRegionBounds = (rx: number, rz: number) => {
        const center = metersToLatLng(rx, rz)
        const halfRegion = METERS_PER_REGION / 2
        const topRight = metersToLatLng(rx * METERS_PER_REGION + halfRegion, rz * METERS_PER_REGION + halfRegion)
        const bottomLeft = metersToLatLng(rx * METERS_PER_REGION - halfRegion, rz * METERS_PER_REGION - halfRegion)
        return {
                minLat: bottomLeft.lat,
                maxLat: topRight.lat,
                minLng: bottomLeft.lng,
                maxLng: topRight.lng,
                center
        }
}

const tileIntersectsBounds = (boundingVolume: any, targetBounds: any): boolean => {
        if (!boundingVolume || !boundingVolume.region) return true
        const [west, south, east, north] = boundingVolume.region
        const { minLat, maxLat, minLng, maxLng } = targetBounds
        return !(east < minLng || west > maxLng || north < minLat || south > maxLat)
}

const shouldRefineChild = (child: any, targetBounds: any): boolean => {
        if (!child.boundingVolume) return true
        if (child.geometricError && child.geometricError < 1.0) return false
        return tileIntersectsBounds(child.boundingVolume, targetBounds)
}

const traverseTileset = async (tileset: any, targetBounds: any, collectedTiles: any[] = [], maxDepth = 3, currentDepth = 0): Promise<any[]> => {
        if (currentDepth >= maxDepth || !tileset) return collectedTiles
        
        if (tileset.content && tileset.content.uri) {
                if (tileIntersectsBounds(tileset.boundingVolume, targetBounds)) {
                        const tileUrl = `/api/v1/google-proxy/tile?uri=${encodeURIComponent(tileset.content.uri)}`
                        const response = await fetch(tileUrl)
                        if (response.ok) {
                                const data = await response.arrayBuffer()
                                collectedTiles.push({
                                        data,
                                        uri: tileset.content.uri,
                                        boundingVolume: tileset.boundingVolume
                                })
                        }
                }
        }
        
        if (tileset.children) {
                for (const child of tileset.children) {
                        if (child.refine === 'REPLACE' || shouldRefineChild(child, targetBounds)) {
                                await traverseTileset(child, targetBounds, collectedTiles, maxDepth, currentDepth + 1)
                        }
                }
        }
        
        return collectedTiles
}

export const fetchGoogleTiles = async (options: GoogleTile3DOptions): Promise<GoogleRegionData> => {
        const { rx, rz } = options
        const bounds = calculateRegionBounds(rx, rz)
        
        const response = await fetch('/api/v1/google-proxy/tileset')
        if (!response.ok) {
                throw new Error(`Failed to fetch root tileset: ${response.status}`)
        }
        
        const rootTileset = await response.json() as any
        const tiles = await traverseTileset(rootTileset.root || rootTileset, bounds)
        
        return {
                lat: bounds.center.lat,
                lng: bounds.center.lng,
                zoom: 15,
                tiles,
                boundingBox: bounds
        }
}

export const loadGoogleTile3D = async (rx: number, rz: number): Promise<ArrayBuffer> => {
        const regionData = await fetchGoogleTiles({ rx, rz })
        
        if (regionData.tiles.length === 0) {
                const fallbackModel = await fetch('/model/cube.glb')
                return await fallbackModel.arrayBuffer()
        }
        
        return regionData.tiles[0].data
}

export const createGoogleTile3DLayer = (options: {
        lat: number
        lng: number
        zoom: number
        apiKey?: string
        onTilesetLoad?: (tileset: any) => void
        onTileLoad?: (tile: any) => void
}) => {
        const tilesetUrl = `/api/v1/google-proxy/tileset`
        
        return new Tile3DLayer({
                id: 'google-3d-tiles',
                data: tilesetUrl,
                loader: Tiles3DLoader,
                loadOptions: {
                        fetch: {
                                headers: options.apiKey ? {
                                        'X-GOOG-API-KEY': options.apiKey
                                } : {}
                        }
                },
                onTilesetLoad: options.onTilesetLoad,
                onTileLoad: options.onTileLoad
        })
}