import { buffer } from './buffer'
import type { Attributes } from './buffer'

interface CapsuleProps {
        radius?: number
        height?: number
        capSegments?: number
        radialSegments?: number
        heightSegments?: number
        needNormal?: boolean
        needIndice?: boolean
}

export const capsule = buffer(({ radius = 1, height = 1, capSegments = 4, radialSegments = 8, heightSegments = 1, needNormal = true, needIndice = false }: CapsuleProps, out: Attributes) => {
        const vertex = [] as number[]
        const normal = [] as number[]

        capSegments = Math.max(1, Math.floor(capSegments))
        radialSegments = Math.max(3, Math.floor(radialSegments))
        heightSegments = Math.max(1, Math.floor(heightSegments))

        const halfHeight = height / 2
        const capArcLength = (Math.PI / 2) * radius
        const cylinderPartLength = height
        const totalArcLength = 2 * capArcLength + cylinderPartLength
        const numVerticalSegments = capSegments * 2 + heightSegments
        const verticesPerRow = radialSegments + 1

        const createIndices = (indice = [] as number[]) => {
                for (let iy = 0; iy < numVerticalSegments; iy++) {
                        for (let ix = 0; ix < radialSegments; ix++) {
                                const i1 = iy * verticesPerRow + ix
                                const i2 = iy * verticesPerRow + ix + 1
                                const i3 = (iy + 1) * verticesPerRow + ix
                                const i4 = (iy + 1) * verticesPerRow + ix + 1
                                indice.push(i1, i2, i3, i2, i4, i3)
                        }
                }
                return indice
        }

        for (let iy = 0; iy <= numVerticalSegments; iy++) {
                let currentArcLength = 0
                let profileY = 0
                let profileRadius = 0
                let normalYComponent = 0

                if (iy <= capSegments) {
                        const segmentProgress = iy / capSegments
                        const angle = (segmentProgress * Math.PI) / 2
                        profileY = -halfHeight - radius * Math.cos(angle)
                        profileRadius = radius * Math.sin(angle)
                        normalYComponent = -radius * Math.cos(angle)
                        currentArcLength = segmentProgress * capArcLength
                } else if (iy <= capSegments + heightSegments) {
                        const segmentProgress = (iy - capSegments) / heightSegments
                        profileY = -halfHeight + segmentProgress * height
                        profileRadius = radius
                        normalYComponent = 0
                        currentArcLength = capArcLength + segmentProgress * cylinderPartLength
                } else {
                        const segmentProgress = (iy - capSegments - heightSegments) / capSegments
                        const angle = (segmentProgress * Math.PI) / 2
                        profileY = halfHeight + radius * Math.sin(angle)
                        profileRadius = radius * Math.cos(angle)
                        normalYComponent = radius * Math.sin(angle)
                        currentArcLength = capArcLength + cylinderPartLength + segmentProgress * capArcLength
                }

                const v = Math.max(0, Math.min(1, currentArcLength / totalArcLength))
                let uOffset = 0

                if (iy === 0) {
                        uOffset = 0.5 / radialSegments
                } else if (iy === numVerticalSegments) {
                        uOffset = -0.5 / radialSegments
                }

                for (let ix = 0; ix <= radialSegments; ix++) {
                        const u = ix / radialSegments
                        const theta = u * Math.PI * 2
                        const sinTheta = Math.sin(theta)
                        const cosTheta = Math.cos(theta)

                        const x = -profileRadius * cosTheta
                        const y = profileY
                        const z = profileRadius * sinTheta

                        vertex.push(x, y, z)

                        if (needNormal) {
                                const nx = -profileRadius * cosTheta
                                const ny = normalYComponent
                                const nz = profileRadius * sinTheta
                                const length = Math.sqrt(nx * nx + ny * ny + nz * nz)
                                if (length > 0) {
                                        normal.push(nx / length, ny / length, nz / length)
                                } else {
                                        normal.push(0, 1, 0)
                                }
                        }
                }
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
