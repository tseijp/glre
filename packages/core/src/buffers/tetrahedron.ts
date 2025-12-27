import { buffer } from './buffer'
import type { Attributes } from './buffer'

interface TetrahedronProps {
        radius?: number
        needNormal?: boolean
        needIndice?: boolean
}

export const tetrahedron = buffer(({ radius = 1, needNormal = true, needIndice = false }: TetrahedronProps, out: Attributes) => {
        // prettier-ignore
        const vertices = [
                1, 1, 1,
                -1, -1, 1,
                -1, 1, -1,
                1, -1, -1
        ]
        // prettier-ignore
        const indices = [
                2, 1, 0,
                0, 3, 2,
                1, 3, 0,
                2, 3, 1
        ]
        const vertex = [] as number[]
        const normal = [] as number[]
        for (let i = 0; i < vertices.length; i += 3) {
                vertex.push(vertices[i] * radius, vertices[i + 1] * radius, vertices[i + 2] * radius)
                if (needNormal) {
                        const len = Math.sqrt(vertices[i] * vertices[i] + vertices[i + 1] * vertices[i + 1] + vertices[i + 2] * vertices[i + 2])
                        normal.push(vertices[i] / len, vertices[i + 1] / len, vertices[i + 2] / len)
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
        if (needNormal) out.normal.push(...normal)
        if (needIndice) out.indice.push(...indices)
})
