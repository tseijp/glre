import { buffer } from './buffer'
import type { Attributes } from './buffer'

interface DodecahedronProps {
        radius?: number
        detail?: number
        needNormal?: boolean
        needIndice?: boolean
}

export const dodecahedron = buffer(({ radius = 1, detail = 0, needNormal = true, needIndice = false }: DodecahedronProps, out: Attributes) => {
        const t = (1 + Math.sqrt(5)) / 2
        const r = 1 / t
        // prettier-ignore
        const baseVertices = [
                -1, -1, -1, -1, -1, 1, -1, 1, -1, -1, 1, 1,
                1, -1, -1, 1, -1, 1, 1, 1, -1, 1, 1, 1,
                0, -r, -t, 0, -r, t, 0, r, -t, 0, r, t,
                -r, -t, 0, -r, t, 0, r, -t, 0, r, t, 0,
                -t, 0, -r, t, 0, -r, -t, 0, r, t, 0, r
        ]
        // prettier-ignore
        const baseIndices = [
                3, 11, 7, 3, 7, 15, 3, 15, 13, 7, 19, 17, 7, 17, 6, 7, 6, 15,
                17, 4, 8, 17, 8, 10, 17, 10, 6, 8, 0, 16, 8, 16, 2, 8, 2, 10,
                0, 12, 1, 0, 1, 18, 0, 18, 16, 6, 10, 2, 6, 2, 13, 6, 13, 15,
                2, 16, 18, 2, 18, 3, 2, 3, 13, 18, 1, 9, 18, 9, 11, 18, 11, 3,
                4, 14, 12, 4, 12, 0, 4, 0, 8, 11, 9, 5, 11, 5, 19, 11, 19, 7,
                19, 5, 14, 19, 14, 4, 19, 4, 17, 1, 12, 14, 1, 14, 5, 1, 5, 9
        ]
        const vertex = [] as number[]
        const normal = [] as number[]
        for (let i = 0; i < baseVertices.length; i += 3) {
                const x = baseVertices[i] * radius
                const y = baseVertices[i + 1] * radius
                const z = baseVertices[i + 2] * radius
                vertex.push(x, y, z)
                if (needNormal) {
                        const length = Math.sqrt(x * x + y * y + z * z)
                        normal.push(x / length, y / length, z / length)
                }
        }
        if (!needIndice) {
                for (const i of baseIndices) {
                        const idx = i * 3
                        out.vertex.push(vertex[idx], vertex[idx + 1], vertex[idx + 2])
                        if (needNormal) out.normal.push(normal[idx], normal[idx + 1], normal[idx + 2])
                }
                return out
        }
        out.vertex.push(...vertex)
        out.normal.push(...normal)
        if (needIndice) out.indice.push(...baseIndices)
})
