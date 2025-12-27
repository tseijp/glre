import { buffer } from './buffer'
import type { Attributes } from './buffer'

interface IcosahedronProps {
        radius?: number
        detail?: number
        needNormal?: boolean
        needIndice?: boolean
}

export const icosahedron = buffer(({ radius = 1, detail = 0, needNormal = true, needIndice = false }: IcosahedronProps, out: Attributes) => {
        const t = (1 + Math.sqrt(5)) / 2

        // prettier-ignore
        const vertices = [
                -1, t, 0, 1, t, 0, -1, -t, 0, 1, -t, 0,
                0, -1, t, 0, 1, t, 0, -1, -t, 0, 1, -t,
                t, 0, -1, t, 0, 1, -t, 0, -1, -t, 0, 1
        ]

        // prettier-ignore
        const indices = [
                0, 11, 5, 0, 5, 1, 0, 1, 7, 0, 7, 10, 0, 10, 11,
                1, 5, 9, 5, 11, 4, 11, 10, 2, 10, 7, 6, 7, 1, 8,
                3, 9, 4, 3, 4, 2, 3, 2, 6, 3, 6, 8, 3, 8, 9,
                4, 9, 5, 2, 4, 11, 6, 2, 10, 8, 6, 7, 9, 8, 1
        ]

        const vertex = [] as number[]
        const normal = [] as number[]

        const pushVertex = (x: number, y: number, z: number) => {
                const len = Math.sqrt(x * x + y * y + z * z)
                const normalizedX = (x / len) * radius
                const normalizedY = (y / len) * radius
                const normalizedZ = (z / len) * radius
                vertex.push(normalizedX, normalizedY, normalizedZ)
                if (needNormal) normal.push(x / len, y / len, z / len)
        }

        const getVertex = (index: number) => {
                const i = index * 3
                return [vertices[i], vertices[i + 1], vertices[i + 2]]
        }

        const subdivideFace = (a: number[], b: number[], c: number[], detail: number) => {
                const cols = detail + 1
                const v = [] as number[][][]

                for (let i = 0; i <= cols; i++) {
                        v[i] = []
                        const aj = [a[0] + (c[0] - a[0]) * (i / cols), a[1] + (c[1] - a[1]) * (i / cols), a[2] + (c[2] - a[2]) * (i / cols)]
                        const bj = [b[0] + (c[0] - b[0]) * (i / cols), b[1] + (c[1] - b[1]) * (i / cols), b[2] + (c[2] - b[2]) * (i / cols)]
                        const rows = cols - i

                        for (let j = 0; j <= rows; j++) {
                                if (j === 0 && i === cols) {
                                        v[i][j] = aj
                                } else {
                                        v[i][j] = [aj[0] + (bj[0] - aj[0]) * (j / rows), aj[1] + (bj[1] - aj[1]) * (j / rows), aj[2] + (bj[2] - aj[2]) * (j / rows)]
                                }
                        }
                }

                for (let i = 0; i < cols; i++) {
                        for (let j = 0; j < 2 * (cols - i) - 1; j++) {
                                const k = Math.floor(j / 2)
                                if (j % 2 === 0) {
                                        pushVertex(v[i][k + 1][0], v[i][k + 1][1], v[i][k + 1][2])
                                        pushVertex(v[i + 1][k][0], v[i + 1][k][1], v[i + 1][k][2])
                                        pushVertex(v[i][k][0], v[i][k][1], v[i][k][2])
                                } else {
                                        pushVertex(v[i][k + 1][0], v[i][k + 1][1], v[i][k + 1][2])
                                        pushVertex(v[i + 1][k + 1][0], v[i + 1][k + 1][1], v[i + 1][k + 1][2])
                                        pushVertex(v[i + 1][k][0], v[i + 1][k][1], v[i + 1][k][2])
                                }
                        }
                }
        }

        for (let i = 0; i < indices.length; i += 3) {
                const a = getVertex(indices[i])
                const b = getVertex(indices[i + 1])
                const c = getVertex(indices[i + 2])
                subdivideFace(a, b, c, detail)
        }

        if (!needIndice) {
                out.vertex.push(...vertex)
                if (needNormal) out.normal.push(...normal)
                return out
        }

        const indexMap = new Map<string, number>()
        const uniqueVertices = [] as number[]
        const uniqueNormals = [] as number[]
        let vertexIndex = 0

        for (let i = 0; i < vertex.length; i += 3) {
                const key = `${vertex[i].toFixed(6)},${vertex[i + 1].toFixed(6)},${vertex[i + 2].toFixed(6)}`
                if (!indexMap.has(key)) {
                        indexMap.set(key, vertexIndex)
                        uniqueVertices.push(vertex[i], vertex[i + 1], vertex[i + 2])
                        if (needNormal) uniqueNormals.push(normal[i], normal[i + 1], normal[i + 2])
                        vertexIndex++
                }
                out.indice.push(indexMap.get(key)!)
        }

        out.vertex.push(...uniqueVertices)
        if (needNormal) out.normal.push(...uniqueNormals)
})
