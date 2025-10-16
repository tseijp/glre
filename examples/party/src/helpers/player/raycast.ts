import { vec3, mat4, vec4 } from 'gl-matrix'
import type { Camera } from './camera'

const ndcToWorld = (out: vec3, x: number, y: number, z: number, iVP: mat4) => {
        const v4 = vec4.fromValues(x, y, z, 1)
        vec4.transformMat4(v4, v4, iVP)
        const invW = 1 / v4[3]
        return vec3.set(out, v4[0] * invW, v4[1] * invW, v4[2] * invW)
}

export const screenToWorldRay = (mouse: number[], size: number[], camera: Camera) => {
        mat4.invert(camera.VP, camera.VP)
        const ndcX = (mouse[0] / size[0]) * 2 - 1
        const ndcY = 1 - (mouse[1] / size[1]) * 2
        const near = ndcToWorld(vec3.create(), ndcX, ndcY, -1, camera.VP)
        const far = ndcToWorld(vec3.create(), ndcX, ndcY, 1, camera.VP)
        const dir = vec3.sub(vec3.create(), far, near)
        vec3.normalize(dir, dir)
        return { origin: near, dir }
}

export type Ray = {
        origin: vec3
        dir: vec3
}

const slab = (ray: Ray, minB: vec3, maxB: vec3) => {
        const inv = vec3.fromValues(1 / (ray.dir[0] || 1e-9), 1 / (ray.dir[1] || 1e-9), 1 / (ray.dir[2] || 1e-9))
        const t1 = vec3.mul(vec3.create(), vec3.sub(vec3.create(), minB, ray.origin), inv)
        const t2 = vec3.mul(vec3.create(), vec3.sub(vec3.create(), maxB, ray.origin), inv)
        const min = vec3.min(vec3.create(), t1, t2)
        const max = vec3.max(vec3.create(), t1, t2)
        const near = Math.max(min[0], min[1], min[2])
        const far = Math.min(max[0], max[1], max[2])
        if (far < 0 || far < near) return null
        return { min, max, near, far }
}

const axisOf = (face: vec3) => (face[0] ? [0, 1, 2] : face[1] ? [1, 0, 2] : [2, 0, 1])

const read = (out: vec3, a: number[], i: number) => vec3.set(out, a[i * 3], a[i * 3 + 1], a[i * 3 + 2])

export const raycast = (ray: Ray, meshes: { pos: number[]; scl: number[]; cnt: number }) => {
        let id = -1
        let near = Infinity
        const c = vec3.create()
        const h = vec3.create()
        const min = vec3.create()
        const max = vec3.create()
        const off = vec3.fromValues(0, 0, 0)
        const face = vec3.create()
        for (let i = 0; i < meshes.cnt; i++) {
                read(h, meshes.scl, i)
                read(c, meshes.pos, i)
                vec3.scale(h, h, 0.5)
                vec3.add(c, c, off)
                vec3.sub(min, c, h)
                vec3.add(max, c, h)
                const hit = slab(ray, min, max)
                if (!hit || hit.near < 0 || near < hit.near) continue
                const axis = hit.min[0] === hit.near ? 0 : hit.min[1] === hit.near ? 1 : 2
                vec3.set(face, 0, 0, 0)
                face[axis] = Math.sign(ray.dir[axis]) * -1
                id = i
                near = hit.near
        }
        if (id < 0) return null
        read(h, meshes.scl, id)
        read(c, meshes.pos, id)
        vec3.scale(h, h, 0.5)
        vec3.add(c, c, off)
        const v = vec3.scaleAndAdd(off, ray.origin, ray.dir, near)
        vec3.sub(v, v, c)
        vec3.add(v, v, h)
        const axis = axisOf(face)
        const uv = [Math.floor(v[axis[1]]), Math.floor(v[axis[2]])]
        return { id, uv, face, near, axis }
}

export type Hit = ReturnType<typeof raycast>

export const face = (hit: Hit, pos: number[], scl: number[]): [number, number, number] | null => {
        if (!hit) return null
        const { id, uv, face, axis } = hit
        const p = vec3.create()
        const s = vec3.create()
        const o = vec3.create()
        read(p, pos, id)
        read(s, scl, id)
        vec3.scaleAndAdd(o, p, s, -0.5)
        o[axis[0]] += face[axis[0]] < 0 ? -1 : s[axis[0]]
        o[axis[1]] += uv[0]
        o[axis[2]] += uv[1]
        return [o[0], o[1], o[2]]
}

export const raycastRegion = (
        ray: Ray,
        meshes: { pos: number[]; scl: number[]; cnt: number; aid?: number[] },
        rid: number,
        off: [number, number, number]
) => {
        const A = (meshes as any).aid as number[]
        if (!A || !A.length) return raycast(ray, meshes)
        let s = -1
        let e = -1
        for (let i = 0; i < A.length; i++) {
                if (A[i] === rid && s < 0) s = i
                if (s >= 0 && A[i] !== rid) {
                        e = i
                        break
                }
        }
        if (s < 0) return null
        if (e < 0) e = A.length
        let id = -1
        let near = Infinity
        const c = vec3.create()
        const h = vec3.create()
        const min = vec3.create()
        const max = vec3.create()
        const offv = vec3.fromValues(off[0], off[1], off[2])
        const faceN = vec3.create()
        for (let i = s; i < e; i++) {
                                read(h, meshes.scl, i)
                                read(c, meshes.pos, i)
                                vec3.scale(h, h, 0.5)
                                vec3.add(c, c, offv)
                                vec3.sub(min, c, h)
                                vec3.add(max, c, h)
                                const hit = slab(ray, min, max)
                                if (!hit || hit.near < 0 || near < hit.near) continue
                                const axis = hit.min[0] === hit.near ? 0 : hit.min[1] === hit.near ? 1 : 2
                                vec3.set(faceN, 0, 0, 0)
                                faceN[axis] = Math.sign(ray.dir[axis]) * -1
                                id = i
                                near = hit.near
        }
        if (id < 0) return null
        read(h, meshes.scl, id)
        read(c, meshes.pos, id)
        vec3.scale(h, h, 0.5)
        vec3.add(c, c, offv)
        const v = vec3.scaleAndAdd(vec3.create(), ray.origin, ray.dir, near)
        vec3.sub(v, v, c)
        vec3.add(v, v, h)
        const axis = axisOf(faceN)
        const uv = [Math.floor(v[axis[1]]), Math.floor(v[axis[2]])]
        return { id, uv, face: faceN, near, axis }
}
