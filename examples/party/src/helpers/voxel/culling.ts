import { mat4, vec3 } from 'gl-matrix'
import { Camera } from '../player/camera'
import { CHUNK, Chunk, Chunks } from '../utils'

let chunks = new Map<string, Uint8Array>()

const keyOf = (i = 0, j = 0, k = 0) => `${i}.${j}.${k}`

export const FLOOR_MAX_Y = 4

const getChunkVox01 = (i = 0, j = 0, k = 0) => chunks.get(keyOf(i, j, k))

const visSphere = (m: mat4, c: vec3, r: number) => {
        const x = c[0]
        const y = c[1]
        const z = c[2]
        const t = (ax: number, ay: number, az: number, aw: number) => {
                const inv = 1 / (Math.hypot(ax, ay, az) || 1)
                return (ax * x + ay * y + az * z + aw) * inv + r < 0
        }
        if (t(m[3] + m[0], m[7] + m[4], m[11] + m[8], m[15] + m[12])) return false
        if (t(m[3] - m[0], m[7] - m[4], m[11] - m[8], m[15] - m[12])) return false
        if (t(m[3] + m[1], m[7] + m[5], m[11] + m[9], m[15] + m[13])) return false
        if (t(m[3] - m[1], m[7] - m[5], m[11] - m[9], m[15] - m[13])) return false
        if (t(m[3] + m[2], m[7] + m[6], m[11] + m[10], m[15] + m[14])) return false
        if (t(m[3] - m[2], m[7] - m[6], m[11] - m[10], m[15] - m[14])) return false
        return true
}

const generate = (c: Chunk) => {
        if (c.gen) return
        const vox = getChunkVox01(c.i, c.j, c.k)
        if (!vox) return
        c.vox.set(vox)
        c.dirty = true
        c.gen = true
}

const ctr = vec3.create()

const _culling = (camera: Camera, c: Chunk) => {
        vec3.set(ctr, c.x + CHUNK * 0.5, c.y + CHUNK * 0.5, c.z + CHUNK * 0.5)
        if (vec3.sqrDist(ctr, camera.position) > camera.far * camera.far) {
                c.visible = false
                return
        }
        const RAD = CHUNK * Math.sqrt(3) * 0.5
        if (!visSphere(camera.VP, ctr, RAD)) {
                c.visible = false
                return
        }
        if (!c.visible) c.dirty = true
        c.visible = true
        generate(c)
}

export const culling = (chunks: Chunks, camera: Camera) => chunks.forEach(_culling.bind(null, camera))
