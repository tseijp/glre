import type { Tileset, Tile, VoxelizedTile } from './loader'

export type Viewport = {
        longitude: number
        latitude: number
        zoom: number
        pitch: number
        bearing: number
        width: number
        height: number
}

export type TileTraversal = { update: (viewport: Viewport) => Promise<Tile[]>; cleanup: () => void }

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

export const estimateMemoryUsage = (tiles: Tile[]): number => {
        let n = 0
        for (const tile of tiles) {
                const a = tile.content?.attributes
                if (!a) continue
                if (a.positions?.value) n += a.positions.value.byteLength
                if (a.normals?.value) n += a.normals.value.byteLength
                if (a.colors?.value) n += a.colors.value.byteLength
                if (a.texCoords?.value) n += a.texCoords.value.byteLength
        }
        return n
}
