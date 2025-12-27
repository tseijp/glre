import { buffer } from './buffer'
import type { Attributes } from './buffer'

interface CylinderProps {
        radiusTop?: number
        radiusBottom?: number
        height?: number
        radialSegments?: number
        heightSegments?: number
        openEnded?: boolean
        thetaStart?: number
        thetaLength?: number
        needNormal?: boolean
        needIndice?: boolean
}

export const cylinder = buffer(({ radiusTop = 1, radiusBottom = 1, height = 1, radialSegments = 32, heightSegments = 1, openEnded = false, thetaStart = 0, thetaLength = Math.PI * 2, needNormal = true, needIndice = false }: CylinderProps, out: Attributes) => {
        const vertex = [] as number[]
        const normal = [] as number[]
        const indices = [] as number[]
        radialSegments = Math.floor(radialSegments)
        heightSegments = Math.floor(heightSegments)
        const slope = (radiusBottom - radiusTop) / height
        const halfHeight = height / 2
        let index = 0
        const indexArray = [] as number[][]
        for (let y = 0; y <= heightSegments; y++) {
                const indexRow = [] as number[]
                const v = y / heightSegments
                const radius = v * (radiusBottom - radiusTop) + radiusTop
                for (let x = 0; x <= radialSegments; x++) {
                        const u = x / radialSegments
                        const theta = u * thetaLength + thetaStart
                        const sinTheta = Math.sin(theta)
                        const cosTheta = Math.cos(theta)
                        vertex.push(radius * sinTheta, -v * height + halfHeight, radius * cosTheta)
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
        for (let x = 0; x < radialSegments; x++) {
                for (let y = 0; y < heightSegments; y++) {
                        const a = indexArray[y][x]
                        const b = indexArray[y + 1][x]
                        const c = indexArray[y + 1][x + 1]
                        const d = indexArray[y][x + 1]
                        if (radiusTop > 0 || y !== 0) indices.push(a, b, d)
                        if (radiusBottom > 0 || y !== heightSegments - 1) indices.push(b, c, d)
                }
        }
        if (!openEnded) {
                if (radiusTop > 0) generateCap(true)
                if (radiusBottom > 0) generateCap(false)
        }
        function generateCap(top: boolean) {
                const centerIndexStart = index
                const radius = top ? radiusTop : radiusBottom
                const sign = top ? 1 : -1
                for (let x = 1; x <= radialSegments; x++) {
                        vertex.push(0, halfHeight * sign, 0)
                        if (needNormal) normal.push(0, sign, 0)
                        index++
                }
                const centerIndexEnd = index
                for (let x = 0; x <= radialSegments; x++) {
                        const u = x / radialSegments
                        const theta = u * thetaLength + thetaStart
                        const cosTheta = Math.cos(theta)
                        const sinTheta = Math.sin(theta)
                        vertex.push(radius * sinTheta, halfHeight * sign, radius * cosTheta)
                        if (needNormal) normal.push(0, sign, 0)
                        index++
                }
                for (let x = 0; x < radialSegments; x++) {
                        const c = centerIndexStart + x
                        const i = centerIndexEnd + x
                        if (top) indices.push(i, i + 1, c)
                        else indices.push(i + 1, i, c)
                }
        }
        if (!needIndice) {
                for (const i of indices) {
                        const idx = i * 3
                        out.vertex.push(vertex[idx], vertex[idx + 1], vertex[idx + 2])
                        if (needNormal) out.normal.push(normal[idx], normal[idx + 1], normal[idx + 2])
                }
                return out
        }
        out.vertex.push(...vertex)
        out.normal.push(...normal)
        if (needIndice) out.indice.push(...indices)
})
