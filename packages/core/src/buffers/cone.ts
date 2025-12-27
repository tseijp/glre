import { buffer } from './buffer'
import type { Attributes } from './buffer'

interface ConeProps {
        radius?: number
        height?: number
        radialSegments?: number
        heightSegments?: number
        openEnded?: boolean
        thetaStart?: number
        thetaLength?: number
        needNormal?: boolean
        needIndice?: boolean
}

export const cone = buffer(({ radius = 1, height = 1, radialSegments = 32, heightSegments = 1, openEnded = false, thetaStart = 0, thetaLength = Math.PI * 2, needNormal = true, needIndice = false }: ConeProps, out: Attributes) => {
        const vertex = [] as number[]
        const normal = [] as number[]
        const indexArray = [] as number[][]
        const halfHeight = height / 2
        let index = 0
        const slope = radius / height
        const createIndices = (indice = [] as number[]) => {
                for (let x = 0; x < radialSegments; x++) {
                        for (let y = 0; y < heightSegments; y++) {
                                const a = indexArray[y][x]
                                const b = indexArray[y + 1][x]
                                const c = indexArray[y + 1][x + 1]
                                const d = indexArray[y][x + 1]
                                if (y !== 0) indice.push(a, b, d)
                                if (y !== heightSegments - 1) indice.push(b, c, d)
                        }
                }
                if (!openEnded && radius > 0) {
                        const centerStart = index
                        for (let x = 1; x <= radialSegments; x++) {
                                vertex.push(0, -halfHeight, 0)
                                if (needNormal) normal.push(0, -1, 0)
                                index++
                        }
                        const centerEnd = index
                        for (let x = 0; x <= radialSegments; x++) {
                                const u = x / radialSegments
                                const theta = u * thetaLength + thetaStart
                                const cosTheta = Math.cos(theta)
                                const sinTheta = Math.sin(theta)
                                vertex.push(radius * sinTheta, -halfHeight, radius * cosTheta)
                                if (needNormal) normal.push(0, -1, 0)
                                index++
                        }
                        for (let x = 0; x < radialSegments; x++) {
                                const c = centerStart + x
                                const i = centerEnd + x
                                indice.push(i + 1, i, c)
                        }
                }
                return indice
        }
        for (let y = 0; y <= heightSegments; y++) {
                const indexRow = []
                const v = y / heightSegments
                const currentRadius = v * radius
                for (let x = 0; x <= radialSegments; x++) {
                        const u = x / radialSegments
                        const theta = u * thetaLength + thetaStart
                        const sinTheta = Math.sin(theta)
                        const cosTheta = Math.cos(theta)
                        vertex.push(currentRadius * sinTheta, -v * height + halfHeight, currentRadius * cosTheta)
                        if (needNormal) {
                                const nx = sinTheta
                                const ny = slope
                                const nz = cosTheta
                                const len = Math.sqrt(nx * nx + ny * ny + nz * nz)
                                normal.push(nx / len, ny / len, nz / len)
                        }
                        indexRow.push(index++)
                }
                indexArray.push(indexRow)
        }
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
