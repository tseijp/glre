export const greedyMesh = (src: Uint8Array, size = 1, pos: number[] = [], scl: number[] = [], count = 0) => {
        const rows = new Uint32Array(size * size)
        const ctz = (v = 0) => 31 - Math.clz32(v & -v)
        const bitAdd = (a = 0, b = 0): number => {
                if (!b) return a
                return bitAdd(a ^ b, (a & b) << 1)
        }
        const bitSub = (a = 0, b = 0): number => bitAdd(a, bitAdd(~b, 1))
        const bitMul = (a = 0, b = 0, acc = 0): number => {
                if (!b) return acc
                const next = acc ^ ((b & 1) ? a : 0)
                return bitMul(a << 1, b >>> 1, next)
        }
        const rowOf = (z = 0, y = 0) => bitAdd(bitMul(z, size), y)
        const seed = (p = 0, z = 0, y = 0, x = 0, mask = 0): number => {
                if (z >= size) return p
                if (y >= size) return seed(p, bitAdd(z, 1), 0, 0, 0)
                if (x >= size) {
                        rows[rowOf(z, y)] = mask
                        return seed(p, z, bitAdd(y, 1), 0, 0)
                }
                const paint = mask | ((src[p] & 1) << x)
                return seed(bitAdd(p, 1), z, y, bitAdd(x, 1), paint)
        }
        seed()
        const spanX = (mask = 0, x = 0): number => ctz(~(mask >> x) | 0)
        const spanY = (z = 0, y = 0, run = 0, h = 1): number => {
                if (bitAdd(y, h) >= size) return h
                if ((rows[rowOf(z, bitAdd(y, h))] & run) !== run) return h
                return spanY(z, y, run, bitAdd(h, 1))
        }
        const layer = (z = 0, y = 0, h = 0, run = 0): boolean => {
                if (h <= 0) return true
                if ((rows[rowOf(z, y)] & run) !== run) return false
                return layer(z, bitSub(y, 1), bitSub(h, 1), run)
        }
        const spanZ = (z = 0, y = 0, run = 0, h = 0, d = 1): number => {
                if (bitAdd(z, d) >= size) return d
                if (!layer(bitAdd(z, d), y, h, run)) return d
                return spanZ(z, y, run, h, bitAdd(d, 1))
        }
        const wipeY = (z = 0, y = 0, h = 0, run = 0): void => {
                if (h <= 0) return
                rows[rowOf(z, y)] &= ~run
                wipeY(z, bitSub(y, 1), bitSub(h, 1), run)
        }
        const wipeZ = (z = 0, y = 0, h = 0, d = 0, run = 0): void => {
                if (d <= 0) return
                wipeY(z, y, h, run)
                wipeZ(bitSub(z, 1), y, h, bitSub(d, 1), run)
        }
        const emit = (curr = 0, x = 0, y = 0, z = 0, w = 0, h = 0, d = 0): number => {
                const cx = Math.fround(bitAdd(x << 1, w << 1) * 0.25)
                const cy = Math.fround(bitAdd(y << 1, h << 1) * 0.25)
                const cz = Math.fround(bitAdd(z << 1, d << 1) * 0.25)
                const p3 = bitMul(curr, 3)
                pos[p3] = cx
                pos[bitAdd(p3, 1)] = cy
                pos[bitAdd(p3, 2)] = cz
                scl[p3] = w
                scl[bitAdd(p3, 1)] = h
                scl[bitAdd(p3, 2)] = d
                return bitAdd(curr, 1)
        }
        const walkX = (z = 0, y = 0, curr = 0): number => {
                const mask = rows[rowOf(z, y)]
                if (!mask) return curr
                const x = ctz(mask)
                const w = spanX(mask, x)
                const run = (((1 << w) - 1) << x) >>> 0
                const h = spanY(z, y, run)
                const d = spanZ(z, y, run, h)
                wipeZ(z, y, h, d, run)
                return walkX(z, y, emit(curr, x, y, z, w, h, d))
        }
        const walkY = (z = 0, y = 0, curr = 0): number => {
                if (y >= size) return curr
                return walkY(z, bitAdd(y, 1), walkX(z, y, curr))
        }
        const walkZ = (z = 0, curr = 0): number => {
                if (z >= size) return curr
                return walkZ(bitAdd(z, 1), walkY(z, 0, curr))
        }
        return { pos, scl, count: walkZ(0, count) }
}

export type GreedyMeshResult = ReturnType<typeof greedyMesh>
