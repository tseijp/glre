import { Tileset3D } from '@loaders.gl/tiles'
import type { Tileset, Tile } from './loader'

export type Viewport = {
        longitude: number
        latitude: number
        zoom: number
        pitch: number
        bearing: number
        width: number
        height: number
}

export type TileTraversal = {
        tileset3D: Tileset3D | null
        visibleTiles: Map<string, Tile>
        loadedTiles: Map<string, ArrayBuffer>
        update: (viewport: Viewport) => Promise<Tile[]>
        cleanup: () => void
}

export const createTileTraversal = (tileset: Tileset): TileTraversal => {
        const visibleTiles = new Map<string, Tile>()
        const loadedTiles = new Map<string, ArrayBuffer>()
        let tileset3D: Tileset3D | null = null

        const initTileset3D = () => {
                if (!tileset3D) {
                        tileset3D = new Tileset3D(tileset, {
                                onTileLoad: (tile: any) => {
                                        visibleTiles.set(tile.id, tile)
                                },
                                onTileUnload: (tile: any) => {
                                        visibleTiles.delete(tile.id)
                                        loadedTiles.delete(tile.id)
                                },
                                maximumMemoryUsage: 512,
                                maximumScreenSpaceError: 16,
                        })
                }
        }

        const update = async (_viewport: Viewport): Promise<Tile[]> => {
                initTileset3D()
                if (!tileset3D) return []
                tileset3D.update({} as any)
                return Array.from(visibleTiles.values())
        }

        const cleanup = () => {
                if (tileset3D) {
                        tileset3D.destroy()
                        tileset3D = null
                }
                visibleTiles.clear()
                loadedTiles.clear()
        }

        return {
                tileset3D,
                visibleTiles,
                loadedTiles,
                update,
                cleanup,
        }
}

export const createFrustumFromViewport = (viewport: Viewport) => {
        const { longitude, latitude, zoom, pitch, bearing, width, height } = viewport

        const fov = Math.PI / 4
        const aspect = width / height
        const near = 0.1
        const far = 10000

        const position = [longitude + Math.sin(bearing) * zoom * 0.01, latitude + Math.cos(bearing) * zoom * 0.01, 1000 / zoom]

        const target = [longitude, latitude, 0]
        const up = [0, 1, 0]

        return {
                fov,
                aspect,
                near,
                far,
                position,
                target,
                up,
                pitch,
                bearing,
        }
}

export const selectTilesInRegion = (tileset: Tileset, bounds: { min: number[]; max: number[] }): Tile[] => {
        const selectedTiles: Tile[] = []

        const traverseTile = (tile: Tile) => {
                if (isTileInBounds(tile, bounds)) {
                        selectedTiles.push(tile)
                }

                if (tile.children) {
                        for (const child of tile.children) {
                                traverseTile(child)
                        }
                }
        }

        traverseTile(tileset.root)
        return selectedTiles
}

const isTileInBounds = (tile: Tile, bounds: { min: number[]; max: number[] }): boolean => {
        if (!tile.boundingVolume) return false

        const bv = tile.boundingVolume
        if (bv.box) {
                const center = bv.box.slice(0, 3)
                return center[0] >= bounds.min[0] && center[0] <= bounds.max[0] && center[1] >= bounds.min[1] && center[1] <= bounds.max[1] && center[2] >= bounds.min[2] && center[2] <= bounds.max[2]
        }

        if (bv.sphere) {
                const center = bv.sphere.slice(0, 3)
                const radius = bv.sphere[3]
                return center[0] - radius >= bounds.min[0] && center[0] + radius <= bounds.max[0] && center[1] - radius >= bounds.min[1] && center[1] + radius <= bounds.max[1] && center[2] - radius >= bounds.min[2] && center[2] + radius <= bounds.max[2]
        }

        return false
}

export const estimateMemoryUsage = (tiles: Tile[]): number => {
        let totalBytes = 0

        for (const tile of tiles) {
                if (tile.content?.attributes) {
                        const attrs = tile.content.attributes
                        if (attrs.positions?.value) totalBytes += attrs.positions.value.byteLength
                        if (attrs.normals?.value) totalBytes += attrs.normals.value.byteLength
                        if (attrs.colors?.value) totalBytes += attrs.colors.value.byteLength
                        if (attrs.texCoords?.value) totalBytes += attrs.texCoords.value.byteLength
                }
        }

        return totalBytes
}
