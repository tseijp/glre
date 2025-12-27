import { buffer } from './buffer'
import type { Attributes } from './buffer'

interface SphereProps {
        radius?: number
        widthSegments?: number
        heightSegments?: number
        phiStart?: number
        phiLength?: number
        thetaStart?: number
        thetaLength?: number
        needNormal?: boolean
        needIndice?: boolean
}

export const sphere = buffer(({ radius = 1, widthSegments = 32, heightSegments = 16, phiStart = 0, phiLength = Math.PI * 2, thetaStart = 0, thetaLength = Math.PI, needNormal = true, needIndice = false }: SphereProps = {}, out: Attributes) => {
        const vertex = [] as number[]
        const normal = [] as number[]
        const createIndices = (indice = [] as number[]) => {
                for (let y = 0; y < heightSegments; y++) {
                        for (let x = 0; x < widthSegments; x++) {
                                const a = (y + 1) * (widthSegments + 1) + x
                                const b = (y + 1) * (widthSegments + 1) + x + 1
                                const c = y * (widthSegments + 1) + x
                                const d = y * (widthSegments + 1) + x + 1
                                indice.push(a, c, b, b, c, d)
                        }
                }
                return indice
        }
        for (let y = 0; y <= heightSegments; y++) {
                const v = y / heightSegments
                const theta = thetaStart + v * thetaLength
                for (let x = 0; x <= widthSegments; x++) {
                        const u = x / widthSegments
                        const phi = phiStart + u * phiLength
                        const st = Math.sin(theta)
                        const ct = Math.cos(theta)
                        const sp = Math.sin(phi)
                        const cp = Math.cos(phi)
                        vertex.push(radius * st * cp, radius * ct, radius * st * sp)
                        if (needNormal) normal.push(st * cp, ct, st * sp)
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
        out.normal.push(...normal)
        if (needIndice) createIndices(out.indice)
        return out
})
