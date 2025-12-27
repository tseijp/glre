import { buffer } from './buffer'
import type { Attributes } from './buffer'

interface TorusProps {
        radius?: number
        tube?: number
        radialSegments?: number
        tubularSegments?: number
        arc?: number
        needNormal?: boolean
        needIndice?: boolean
}

export const torus = buffer(({ radius = 1, tube = 0.4, radialSegments = 12, tubularSegments = 48, arc = Math.PI * 2, needNormal = true, needIndice = false }: TorusProps, out: Attributes) => {
        const vertex = [] as number[]
        const normal = [] as number[]
        const radialSeg = Math.floor(radialSegments)
        const tubularSeg = Math.floor(tubularSegments)
        const createIndices = (indice = [] as number[]) => {
                for (let j = 1; j <= radialSeg; j++) {
                        for (let i = 1; i <= tubularSeg; i++) {
                                const a = (tubularSeg + 1) * j + i - 1
                                const b = (tubularSeg + 1) * (j - 1) + i - 1
                                const c = (tubularSeg + 1) * (j - 1) + i
                                const d = (tubularSeg + 1) * j + i
                                indice.push(a, b, d, b, c, d)
                        }
                }
                return indice
        }
        for (let j = 0; j <= radialSeg; j++) {
                for (let i = 0; i <= tubularSeg; i++) {
                        const u = (i / tubularSeg) * arc
                        const v = (j / radialSeg) * Math.PI * 2
                        const cosV = Math.cos(v)
                        const sinV = Math.sin(v)
                        const cosU = Math.cos(u)
                        const sinU = Math.sin(u)
                        const x = (radius + tube * cosV) * cosU
                        const y = (radius + tube * cosV) * sinU
                        const z = tube * sinV
                        vertex.push(x, y, z)
                        if (needNormal) {
                                const centerX = radius * cosU
                                const centerY = radius * sinU
                                const normalX = x - centerX
                                const normalY = y - centerY
                                const normalZ = z
                                const length = Math.sqrt(normalX * normalX + normalY * normalY + normalZ * normalZ)
                                normal.push(normalX / length, normalY / length, normalZ / length)
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
        out.normal.push(...normal)
        if (needIndice) createIndices(out.indice)
})
