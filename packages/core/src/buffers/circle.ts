import { buffer } from './buffer'
import type { Attributes } from './buffer'

interface CircleProps {
        radius?: number
        segments?: number
        thetaStart?: number
        thetaLength?: number
        needNormal?: boolean
        needIndice?: boolean
}

export const circle = buffer(({ radius = 1, segments = 32, thetaStart = 0, thetaLength = Math.PI * 2, needNormal = true, needIndice = false }: CircleProps, out: Attributes) => {
        const vertex = [] as number[]
        const normal = [] as number[]
        const createIndices = (indice = [] as number[]) => {
                for (let i = 1; i <= segments; i++) {
                        indice.push(i, i + 1, 0)
                }
                return indice
        }
        vertex.push(0, 0, 0)
        if (needNormal) normal.push(0, 0, 1)
        for (let s = 0; s <= segments; s++) {
                const segment = thetaStart + (s / segments) * thetaLength
                const x = radius * Math.cos(segment)
                const y = radius * Math.sin(segment)
                vertex.push(x, y, 0)
                if (needNormal) normal.push(0, 0, 1)
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
