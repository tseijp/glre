import { buffer } from './buffer'
import type { Attributes } from './buffer'

interface BoxProps {
        width?: number
        height?: number
        depth?: number
        widthSegments?: number
        heightSegments?: number
        depthSegments?: number
        needNormal?: boolean
        needIndice?: boolean
}

export const box = buffer(({ width = 1, height = 1, depth = 1, widthSegments = 1, heightSegments = 1, depthSegments = 1, needNormal = true, needIndice = false }: BoxProps, out: Attributes) => {
        const vertex = [] as number[]
        const normal = [] as number[]
        let numberOfVertices = 0
        const createIndices = (indice = [] as number[]) => {
                const buildPlaneIndices = (gridX: number, gridY: number, startVertex: number) => {
                        for (let iy = 0; iy < gridY; iy++) {
                                for (let ix = 0; ix < gridX; ix++) {
                                        const gridX1 = gridX + 1
                                        const a = startVertex + ix + gridX1 * iy
                                        const b = startVertex + ix + gridX1 * (iy + 1)
                                        const c = startVertex + (ix + 1) + gridX1 * (iy + 1)
                                        const d = startVertex + (ix + 1) + gridX1 * iy
                                        indice.push(a, b, d, b, c, d)
                                }
                        }
                        return (gridX + 1) * (gridY + 1)
                }
                numberOfVertices += buildPlaneIndices(depthSegments, heightSegments, numberOfVertices)
                numberOfVertices += buildPlaneIndices(depthSegments, heightSegments, numberOfVertices)
                numberOfVertices += buildPlaneIndices(widthSegments, depthSegments, numberOfVertices)
                numberOfVertices += buildPlaneIndices(widthSegments, depthSegments, numberOfVertices)
                numberOfVertices += buildPlaneIndices(widthSegments, heightSegments, numberOfVertices)
                numberOfVertices += buildPlaneIndices(widthSegments, heightSegments, numberOfVertices)
                return indice
        }
        const buildPlane = (u: string, v: string, w: string, udir: number, vdir: number, planeWidth: number, planeHeight: number, planeDepth: number, gridX: number, gridY: number) => {
                const segmentWidth = planeWidth / gridX
                const segmentHeight = planeHeight / gridY
                const widthHalf = planeWidth / 2
                const heightHalf = planeHeight / 2
                const depthHalf = planeDepth / 2
                const gridX1 = gridX + 1
                const gridY1 = gridY + 1
                for (let iy = 0; iy < gridY1; iy++) {
                        const y = iy * segmentHeight - heightHalf
                        for (let ix = 0; ix < gridX1; ix++) {
                                const x = ix * segmentWidth - widthHalf
                                const vector = [0, 0, 0]
                                vector[u === 'x' ? 0 : u === 'y' ? 1 : 2] = x * udir
                                vector[v === 'x' ? 0 : v === 'y' ? 1 : 2] = y * vdir
                                vector[w === 'x' ? 0 : w === 'y' ? 1 : 2] = depthHalf
                                vertex.push(vector[0], vector[1], vector[2])
                                if (needNormal) {
                                        const normalVector = [0, 0, 0]
                                        normalVector[w === 'x' ? 0 : w === 'y' ? 1 : 2] = planeDepth > 0 ? 1 : -1
                                        normal.push(normalVector[0], normalVector[1], normalVector[2])
                                }
                        }
                }
        }
        buildPlane('z', 'y', 'x', -1, -1, depth, height, width, depthSegments, heightSegments)
        buildPlane('z', 'y', 'x', 1, -1, depth, height, -width, depthSegments, heightSegments)
        buildPlane('x', 'z', 'y', 1, 1, width, depth, height, widthSegments, depthSegments)
        buildPlane('x', 'z', 'y', 1, -1, width, depth, -height, widthSegments, depthSegments)
        buildPlane('x', 'y', 'z', 1, -1, width, height, depth, widthSegments, heightSegments)
        buildPlane('x', 'y', 'z', -1, -1, width, height, -depth, widthSegments, heightSegments)
        if (!needIndice) {
                const indice = createIndices()
                for (const i of indice) {
                        const idx = i * 3
                        out.vertex.push(vertex[idx], vertex[idx + 1], vertex[idx + 2])
                        if (needNormal) out.normal.push(normal[idx], normal[idx + 1], normal[idx + 2])
                }
                return out
        }
        out.vertex.push(...vertex)
        if (needNormal) out.normal.push(...normal)
        if (needIndice) createIndices(out.indice)
})
