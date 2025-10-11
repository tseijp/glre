export const getIndex = (size = 1, x = 0, y = 0, z = 0) => x + (y + z * size) * size

export const greedyMesh = (src: Uint8Array, size = 1, pos: number[] = [], scl: number[] = [], cnt = 0) => {
        const data = new Uint8Array(src)

        const isHitWidth = (x = 0, y = 0, z = 0) => {
                if (x >= size) return true
                const idx = getIndex(size, x, y, z)
                return !data[idx]
        }

        const isHitHeight = (x = 0, y = 0, z = 0, w = 0) => {
                if (y >= size) return true
                for (let i = 0; i < w; i++) if (isHitWidth(x + i, y, z)) return true
                return false
        }

        const isHitDepth = (x = 0, y = 0, z = 0, w = 1, h = 1) => {
                if (z >= size) return true
                for (let j = 0; j < h; j++) if (isHitHeight(x, y + j, z, w)) return true
                return false
        }

        const hitWidth = (x = 0, y = 0, z = 0, w = 1) => {
                if (isHitWidth(x + w, y, z)) return w
                return hitWidth(x, y, z, w + 1)
        }

        const hitHeight = (x = 0, y = 0, z = 0, w = 1, h = 1) => {
                if (isHitHeight(x, y + h, z, w)) return h
                return hitHeight(x, y, z, w, h + 1)
        }

        const hitDepth = (x = 0, y = 0, z = 0, w = 1, h = 1, d = 1) => {
                if (isHitDepth(x, y, z + d, w, h)) return d
                return hitDepth(x, y, z, w, h, d + 1)
        }

        const markVisited = (x = 0, y = 0, z = 0, w = 1, h = 1, d = 1) => {
                for (let k = 0; k < d; k++)
                        for (let j = 0; j < h; j++)
                                for (let i = 0; i < w; i++) {
                                        data[getIndex(size, x + i, y + j, z + k)] = 0
                                }
        }

        const tick = (x = 0, y = 0, z = 0) => {
                const idx = getIndex(size, x, y, z)
                if (!data[idx]) return
                const w = hitWidth(x, y, z, 1)
                const h = hitHeight(x, y, z, w, 1)
                const d = hitDepth(x, y, z, w, h, 1)
                markVisited(x, y, z, w, h, d)
                pos[3 * cnt] = w * 0.5 + x
                pos[3 * cnt + 1] = h * 0.5 + y
                pos[3 * cnt + 2] = d * 0.5 + z
                scl[cnt * 3] = w
                scl[cnt * 3 + 1] = h
                scl[cnt * 3 + 2] = d
                cnt++
        }

        for (let x = 0; x < size; x++) for (let y = 0; y < size; y++) for (let z = 0; z < size; z++) tick(x, y, z)

        return { pos, scl, cnt }
}
