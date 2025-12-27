import { buffer } from './buffer'
import type { Attributes } from './buffer'

interface TorusKnotProps {
        radius?: number
        tube?: number
        tubularSegments?: number
        radialSegments?: number
        p?: number
        q?: number
        needNormal?: boolean
        needIndice?: boolean
}

export const torusKnot = buffer(({ radius = 1, tube = 0.4, tubularSegments = 64, radialSegments = 8, p = 2, q = 3, needNormal = true, needIndice = false }: TorusKnotProps, out: Attributes) => {
        const vertex = [] as number[]
        const normal = [] as number[]
        const calculatePositionOnCurve = (u: number) => {
                const cu = Math.cos(u)
                const su = Math.sin(u)
                const quOverP = (q / p) * u
                const cs = Math.cos(quOverP)
                return {
                        x: radius * (2 + cs) * 0.5 * cu,
                        y: radius * (2 + cs) * su * 0.5,
                        z: radius * Math.sin(quOverP) * 0.5,
                }
        }
        const createIndices = (indice = [] as number[]) => {
                for (let j = 1; j <= tubularSegments; j++) {
                        for (let i = 1; i <= radialSegments; i++) {
                                const a = (radialSegments + 1) * (j - 1) + (i - 1)
                                const b = (radialSegments + 1) * j + (i - 1)
                                const c = (radialSegments + 1) * j + i
                                const d = (radialSegments + 1) * (j - 1) + i
                                indice.push(a, b, d, b, c, d)
                        }
                }
                return indice
        }
        for (let i = 0; i <= tubularSegments; i++) {
                const u = (i / tubularSegments) * p * Math.PI * 2
                const P1 = calculatePositionOnCurve(u)
                const P2 = calculatePositionOnCurve(u + 0.01)
                const T = {
                        x: P2.x - P1.x,
                        y: P2.y - P1.y,
                        z: P2.z - P1.z,
                }
                const N = {
                        x: P2.x + P1.x,
                        y: P2.y + P1.y,
                        z: P2.z + P1.z,
                }
                const B = {
                        x: T.y * N.z - T.z * N.y,
                        y: T.z * N.x - T.x * N.z,
                        z: T.x * N.y - T.y * N.x,
                }
                const BNorm = {
                        x: N.y * B.z - N.z * B.y,
                        y: N.z * B.x - N.x * B.z,
                        z: N.x * B.y - N.y * B.x,
                }
                const BLen = Math.sqrt(B.x * B.x + B.y * B.y + B.z * B.z)
                const NLen = Math.sqrt(BNorm.x * BNorm.x + BNorm.y * BNorm.y + BNorm.z * BNorm.z)
                B.x /= BLen
                B.y /= BLen
                B.z /= BLen
                BNorm.x /= NLen
                BNorm.y /= NLen
                BNorm.z /= NLen
                for (let j = 0; j <= radialSegments; j++) {
                        const v = (j / radialSegments) * Math.PI * 2
                        const cx = -tube * Math.cos(v)
                        const cy = tube * Math.sin(v)
                        const vx = P1.x + (cx * BNorm.x + cy * B.x)
                        const vy = P1.y + (cx * BNorm.y + cy * B.y)
                        const vz = P1.z + (cx * BNorm.z + cy * B.z)
                        vertex.push(vx, vy, vz)
                        if (needNormal) {
                                const nx = vx - P1.x
                                const ny = vy - P1.y
                                const nz = vz - P1.z
                                const nLen = Math.sqrt(nx * nx + ny * ny + nz * nz)
                                normal.push(nx / nLen, ny / nLen, nz / nLen)
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
