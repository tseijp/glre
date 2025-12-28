import { buffer } from './buffer'
import type { Attributes } from './buffer'

interface RingProps {
        innerRadius?: number
        outerRadius?: number
        thetaSegments?: number
        phiSegments?: number
        thetaStart?: number
        thetaLength?: number
        needNormal?: boolean
        needIndice?: boolean
}

export const ring = buffer(({ innerRadius = 0.5, outerRadius = 1, thetaSegments = 32, phiSegments = 1, thetaStart = 0, thetaLength = Math.PI * 2, needNormal = true, needIndice = false }: RingProps, out: Attributes) => {
        thetaSegments = Math.max(3, thetaSegments)
        phiSegments = Math.max(1, phiSegments)

        const vertex = [] as number[]
        const normal = [] as number[]

        const createIndices = (indice = [] as number[]) => {
                for (let j = 0; j < phiSegments; j++) {
                        const thetaSegmentLevel = j * (thetaSegments + 1)
                        for (let i = 0; i < thetaSegments; i++) {
                                const segment = i + thetaSegmentLevel
                                const a = segment
                                const b = segment + thetaSegments + 1
                                const c = segment + thetaSegments + 2
                                const d = segment + 1
                                indice.push(a, b, d, b, c, d)
                        }
                }
                return indice
        }

        let radius = innerRadius
        const radiusStep = (outerRadius - innerRadius) / phiSegments

        for (let j = 0; j <= phiSegments; j++) {
                for (let i = 0; i <= thetaSegments; i++) {
                        const segment = thetaStart + (i / thetaSegments) * thetaLength
                        const x = radius * Math.cos(segment)
                        const y = radius * Math.sin(segment)
                        vertex.push(x, y, 0)
                        if (needNormal) normal.push(0, 0, 1)
                }
                radius += radiusStep
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
        out.normal.push(...normal)
        if (needIndice) createIndices(out.indice)
})
