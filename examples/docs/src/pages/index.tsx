// @ts-ignore
import Layout from '@theme/Layout'
import * as m from 'gl-matrix'
import { useEffect, useState } from 'react'
import { GL, useGL } from 'glre/src/react'
import { attribute, uniform, vec4, vec3, Fn, vertexStage, instance, float, vec2, texture, clamp, If, mat4, texture2D } from 'glre/src/node'
import type { Float, Vec2, Vec3 } from 'glre/src/node'
const SCOPE = { x0: 28, x1: 123, y0: 75, y1: 79 }
const ROW = SCOPE.x1 - SCOPE.x0 + 1 // 96 region = 96×16×16 voxel
const SLOT = 16
const CHUNK = 16
const REGION = 256
const LIGHT_DIR = [-0.33, 0.77, 0.55] // normalized afternoon sun
const ATLAS_URL = `https://pub-a3916cfad25545dc917e91549e7296bc.r2.dev/v1` // `http://localhost:5173/logs`
const clampScope = (i = 0, j = 0) => SCOPE.x0 <= i && i <= SCOPE.x1 && SCOPE.y0 <= j && j <= SCOPE.y1
const offOf = (i = SCOPE.x0, j = SCOPE.y0) => [REGION * (i - SCOPE.x0), 0, REGION * (SCOPE.y1 - j)]
const camOf = (pos = m.vec3.create()) => ({ i: SCOPE.x0 + Math.floor(pos[0] / REGION), j: SCOPE.y1 - Math.floor(pos[1] / REGION) })
const range = (n = 0) => [...Array(n).keys()]
const chunkId = (i = 0, j = 0, k = 0) => i + j * CHUNK + k * CHUNK * CHUNK
const regionId = (i = 0, j = 0) => i + 160 * j // DO NOT CHANGE
const cullRegion = (VP = m.mat4.create(), rx = 0, ry = 0, rz = 0) => visSphere(VP, rx + 128, ry + 128, rz + 128, Math.sqrt(256 * 256 * 3) * 0.5)
const solid = (f: (i: number, j: number, k: number) => void, n = CHUNK) => {
        for (let k = 0; k < n; k++) for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) f(i, j, k)
}
const createImage = async (src = '') => {
        const img = new Image()
        const promise = new Promise<HTMLImageElement>((resolve) => void (img.onload = () => resolve(img)))
        Object.assign(img, { src, crossOrigin: 'anonymous' })
        return await promise
}
const createContext = () => {
        const el = document.createElement('canvas')
        Object.assign(el, { width: 4096, height: 4096 })
        return el.getContext('2d', { willReadFrequently: true })
}
const visSphere = (M = m.mat4.create(), cx = 0, cy = 0, cz = 0, r = 1) => {
        const t = (ax = 0, ay = 0, az = 0, aw = 0) => (ax * cx + ay * cy + az * cz + aw) / (Math.hypot(ax, ay, az) || 1) + r < 0
        if (t(M[3] + M[0], M[7] + M[4], M[11] + M[8], M[15] + M[12])) return false
        if (t(M[3] - M[0], M[7] - M[4], M[11] - M[8], M[15] - M[12])) return false
        if (t(M[3] + M[1], M[7] + M[5], M[11] + M[9], M[15] + M[13])) return false
        if (t(M[3] - M[1], M[7] - M[5], M[11] - M[9], M[15] - M[13])) return false
        if (t(M[3] + M[2], M[7] + M[6], M[11] + M[10], M[15] + M[14])) return false
        if (t(M[3] - M[2], M[7] - M[6], M[11] - M[10], M[15] - M[14])) return false
        return true
}
const greedyMesh = (src: Uint8Array, size = 1, pos: number[] = [], scl: number[] = [], count = 0) => {
        const index = (x = 0, y = 0, z = 0) => x + (y + z * size) * size
        const data = new Uint8Array(src)
        const isHitWidth = (x = 0, y = 0, z = 0) => {
                if (x >= size) return true
                const idx = index(x, y, z)
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
                for (let k = 0; k < d; k++) for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) data[index(x + i, y + j, z + k)] = 0
        }
        const tick = (x = 0, y = 0, z = 0) => {
                const idx = index(x, y, z)
                if (!data[idx]) return
                const w = hitWidth(x, y, z, 1)
                const h = hitHeight(x, y, z, w, 1)
                const d = hitDepth(x, y, z, w, h, 1)
                markVisited(x, y, z, w, h, d)
                pos[3 * count] = w * 0.5 + x
                pos[3 * count + 1] = h * 0.5 + y
                pos[3 * count + 2] = d * 0.5 + z
                scl[count * 3] = w
                scl[count * 3 + 1] = h
                scl[count * 3 + 2] = d
                count++
        }
        solid(tick, size)
        return { pos, scl, count }
}
const _fwd = m.vec3.fromValues(0, 0, -1)
const _up = m.vec3.fromValues(0, 1, 0)
const _t0 = m.vec3.create()
const _t1 = m.vec3.create()
const _t2 = m.mat4.create()
const _t3 = m.mat4.create()
const clampToFace = (pos = 0, half = 0.5, sign = 0, base = Math.floor(pos)) => (sign > 0 ? Math.min(pos, base + 1 - half) : Math.max(pos, base + half))
const lookAt = (eye = m.vec3.create(), pos = m.vec3.create(), face = m.vec3.create()) => m.vec3.scaleAndAdd(eye, pos, face, 10)
const faceDir = (out = m.vec3.create(), yaw = 0, pitch = 0) => {
        m.mat4.identity(_t2)
        m.mat4.rotateY(_t2, _t2, yaw)
        m.mat4.rotateX(_t2, _t2, pitch)
        m.vec3.transformMat4(out, _fwd, _t2)
        return out
}
const moveDir = (out = m.vec3.create(), dir = m.vec3.create(), speed = 1, planar = false) => {
        m.vec3.copy(_t1, out)
        _t1[1] = 0
        if (m.vec3.squaredLength(_t1) < 1e-8) {
                _t1[0] = _t1[1] = 0
                _t1[2] = -1
        }
        m.vec3.normalize(_t1, _t1)
        m.vec3.cross(_t0, _up, _t1)
        m.vec3.normalize(_t0, _t0)
        const fwd = planar ? _t1 : out
        m.vec3.scale(_t0, _t0, dir[0])
        m.vec3.scale(_t1, fwd, dir[2])
        m.vec3.add(out, _t0, _t1)
        m.vec3.scale(out, out, speed)
        return out
}
const perspective = (MVP = m.mat4.create(), pos = m.vec3.create(), eye = m.vec3.create(), aspect = 1, offsetY = 0) => {
        m.mat4.perspective(_t2, (28 * Math.PI) / 180, aspect, 0.1, 4000)
        m.vec3.copy(_t0, pos)
        m.vec3.copy(_t1, eye)
        _t0[1] += offsetY
        _t1[1] += offsetY
        m.mat4.lookAt(_t3, _t0, _t1, _up)
        m.mat4.multiply(MVP, _t2, _t3)
}
const createCamera = ({ yaw = Math.PI * 0.5, pitch = -Math.PI * 0.45, mode = -1, X = 0, Y = 0, Z = 0, DASH = 2.5, MOVE = 12, JUMP = 12, GROUND = 0, SIZE = [0.8, 1.8, 0.8], GRAVITY = -50, TURN = 1 / 500 }) => {
        let x = 0
        let dash = 1
        let isGround = false
        const MVP = m.mat4.create()
        const pos = m.vec3.fromValues(X, Y, Z)
        const eye = m.vec3.fromValues(X - 10, Y, Z)
        const vel = m.vec3.fromValues(0, 0, 0)
        const dir = m.vec3.fromValues(0, 0, 0)
        const face = m.vec3.fromValues(-1, 0, 0)
        const asdw = (axis = 0, delta = 0) => {
                if (axis === 0) dir[1] = delta
                if (axis === 1) dir[2] = delta
                if (axis === 2) dir[0] = delta
        }
        const shift = (isPress = true) => {
                if (mode === 0) asdw(0, isPress ? -1 : 0)
                if (mode === 1 && isGround) dash = isPress ? DASH : 1
        }
        const space = (isPress = true) => {
                if (mode === 0) asdw(0, isPress ? 1 : 0)
                if (mode === 1 && isGround && isPress) vel[1] = JUMP
        }
        const turn = (delta = [0, 0]) => {
                const r = mode === 1 ? 1 : 0.1
                yaw += delta[0] * r * TURN
                pitch += delta[1] * r * TURN
                pitch = Math.min(pitch, Math.PI / 2 - 0.01)
                pitch = Math.max(pitch, -Math.PI / 2 + 0.01)
                faceDir(face, yaw, pitch)
                lookAt(eye, pos, face)
        }
        const collide = (axis = 0, pick = (_x = 0, _y = 0, _z = 0) => 0) => {
                const v = vel[axis]
                if (!v) return
                const s = Math.sign(v)
                const xyz = m.vec3.clone(pos)
                xyz[axis] += s
                if (!pick(...m.vec3.floor(xyz, xyz))) return
                if (axis === 1 && s < 0) isGround = true
                pos[axis] = clampToFace(pos[axis], SIZE[axis] * 0.5, s)
                vel[axis] = 0
        }
        const tick = (dt = 0, pick = (_x = 0, _y = 0, _z = 0) => 0) => {
                if (mode === 2) return
                if (mode === -1) {
                        x -= dt * MOVE
                        pos[0] = X + x
                        if (pos[0] < 0) pos[0] = ROW * REGION
                        if (pos[0] > ROW * REGION) pos[0] = 0
                        lookAt(eye, pos, face)
                }
                const speed = MOVE * dash * (mode === 0 ? 20 : 1)
                const move = moveDir(m.vec3.clone(face), dir, speed, mode === 1)
                vel[0] = move[0]
                vel[2] = move[2]
                if (mode === 0) {
                        pos[0] += vel[0] * dt
                        pos[1] += dir[1] * dt * speed
                        pos[2] += vel[2] * dt
                }
                if (mode === 1) {
                        vel[1] += GRAVITY * dt
                        const vmax = Math.max(Math.abs(vel[0]), Math.abs(vel[1]), Math.abs(vel[2]))
                        const STEP = 0.25
                        let steps = Math.ceil((vmax * dt) / STEP)
                        if (steps < 1) steps = 1
                        const sdt = dt / steps
                        isGround = false // update isGround in collide()
                        for (let i = 0; i < steps; i++) {
                                pos[1] += vel[1] * sdt
                                collide(1, pick)
                                pos[0] += vel[0] * sdt
                                collide(0, pick)
                                pos[2] += vel[2] * sdt
                                collide(2, pick)
                        }
                        if (pos[1] < GROUND) void ((pos[1] = Y), (vel[1] = 0))
                }
                lookAt(eye, pos, face)
        }
        faceDir(face, yaw, pitch)
        lookAt(eye, pos, face)
        const HEAD = SIZE[1] * 0.5
        return { pos, MVP, tick, turn, shift, space, asdw, mode: (x = 0) => (mode = x), update: (aspect = 1) => perspective(MVP, pos, eye, aspect, HEAD) }
}
const createMesh = () => {
        let count = 1
        let pos = [0, 0, 0]
        let scl = [1, 1, 1]
        let aid = [0]
        let _count = 0
        let _pos = [] as number[]
        let _scl = [] as number[]
        let _aid = [] as number[]
        const buf = {} as Record<string, WebGLBuffer>
        const attr = (c: WebGL2RenderingContext, pg: WebGLProgram, data: number[], key = 'pos', size = 3) => {
                const loc = c.getAttribLocation(pg, key)
                const array = new Float32Array(data)
                const buffer = (buf[key] = buf[key] || c.createBuffer())
                c.bindBuffer(c.ARRAY_BUFFER, buffer)
                if (!buf[key + ':init']) {
                        c.bufferData(c.ARRAY_BUFFER, array, c.DYNAMIC_DRAW)
                        c.enableVertexAttribArray(loc)
                        c.vertexAttribPointer(loc, size, c.FLOAT, false, 0, 0)
                        c.vertexAttribDivisor(loc, 1)
                        buf[key + ':init'] = 1
                        buf[key + ':len'] = array.length
                        return
                }
                if (buf[key + ':len'] !== array.length) {
                        c.bufferData(c.ARRAY_BUFFER, array, c.DYNAMIC_DRAW)
                        buf[key + ':len'] = array.length
                        return
                }
                c.bufferSubData(c.ARRAY_BUFFER, 0, array)
        }
        const reset = () => {
                _pos.length = _scl.length = _aid.length = _count = 0
        }
        const merge = (c: Chunk, index = 0) => {
                _count += c.count()
                _pos.push(...c.pos)
                _scl.push(...c.scl)
                for (let i = 0; i < c.count(); i++) _aid.push(index)
        }
        const commit = () => {
                if (!_count) return false
                ;[pos, _pos, scl, _scl, aid, _aid, count] = [_pos, pos, _scl, scl, _aid, aid, _count]
                reset()
                return true
        }
        const draw = (c: WebGL2RenderingContext, pg: WebGLProgram) => {
                if (!count) {
                        pos.push(0, 0, 0)
                        scl.push(1, 1, 1)
                        aid.push(0)
                        count = 1
                }
                attr(c, pg, scl, 'scl', 3)
                attr(c, pg, pos, 'pos', 3)
                attr(c, pg, aid, 'aid', 1)
                return count
        }
        return { reset, merge, draw, commit, count: () => count }
}
const createNode = () => {
        const iMVP = uniform<'mat4'>(mat4(), 'iMVP')
        const iAtlas = range(SLOT).map((i) => uniform(texture2D(), `iAtlas${i}`))
        const iOffset = range(SLOT).map((i) => uniform(vec3(0, 0, 0), `iOffset${i}`))
        const atlasUV = Fn(([local, p, n]: [Vec3, Vec3, Vec3]) => {
                const half = float(0.5)
                const wp = p.add(local).sub(n.sign().mul(half)).floor().toVar('wp') // world pos
                const ci = wp.div(16).floor().toVar('c') // chunk index in the workd
                const lp = wp.sub(ci.mul(16)).clamp(0, 15).ceil().toVar('l') // local pos in the chunk
                const zt = vec2(ci.z.mod(4).mul(1024), ci.z.div(4).floor().mul(1024))
                const ct = vec2(ci.x.mul(64), ci.y.mul(64))
                const lt = vec2(lp.z.mod(4).mul(16).add(lp.x), lp.z.div(4).floor().mul(16).add(lp.y))
                const uv = zt.add(ct).add(lt).add(vec2(0.5)).div(4096)
                const eps = float(0.5).div(4096)
                return clamp(uv, vec2(eps), vec2(float(1).sub(eps)))
        })
        const pick = Fn(([id, uv]: [Float, Vec2]) => {
                const t = vec4(0, 0, 0, 1).toVar('t')
                range(SLOT).map((i) => {
                        If(id.equal(i), () => {
                                t.assign(texture(iAtlas[i], uv))
                        })
                })
                return t
        })
        const vertex = attribute<'vec3'>([-0.5, -0.5, -0.5, -0.5, -0.5, 0.5, -0.5, 0.5, 0.5, -0.5, 0.5, 0.5, -0.5, 0.5, -0.5, -0.5, -0.5, -0.5, 0.5, -0.5, 0.5, 0.5, -0.5, -0.5, 0.5, 0.5, -0.5, 0.5, 0.5, -0.5, 0.5, 0.5, 0.5, 0.5, -0.5, 0.5, -0.5, -0.5, -0.5, 0.5, -0.5, -0.5, 0.5, -0.5, 0.5, 0.5, -0.5, 0.5, -0.5, -0.5, 0.5, -0.5, -0.5, -0.5, -0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, -0.5, 0.5, 0.5, -0.5, -0.5, 0.5, -0.5, -0.5, 0.5, 0.5, 0.5, -0.5, -0.5, -0.5, -0.5, -0.5, -0.5, 0.5, -0.5, -0.5, 0.5, -0.5, 0.5, 0.5, -0.5, 0.5, -0.5, -0.5, -0.5, -0.5, 0.5, 0.5, -0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, -0.5, 0.5, 0.5, -0.5, -0.5, 0.5], 'vertex')
        const normal = attribute<'vec3'>([-1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1], 'normal')
        const scl = instance<'vec3'>(vec3(), 'scl')
        const pos = instance<'vec3'>(vec3(), 'pos')
        const aid = instance<'float'>(float(), 'aid')
        const fs = Fn(([local, p, n, i]: [Vec3, Vec3, Vec3, Float]) => {
                const L = vec3(LIGHT_DIR).normalize()
                const diffuse = n.normalize().dot(L).mul(0.5).add(0.5)
                const uv = atlasUV(local, p, n).toVar('uv')
                const texel = pick(i, uv).toVar('t')
                const rgb = texel.rgb.mul(diffuse).toVar('rgb')
                return vec4(rgb, 1)
        })
        const vs = Fn(([pos, scl, aid]: [Vec3, Vec3, Float]) => {
                const off = vec3(0, 0, 0).toVar('roff')
                range(SLOT).forEach((i) => {
                        If(aid.equal(i), () => {
                                off.assign(iOffset[i])
                        })
                })
                const local = vertex.mul(scl).add(pos)
                const world = off.add(local)
                return iMVP.mul(vec4(world, 1))
        })
        const frag = fs(vertexStage(vertex.mul(scl)), vertexStage(pos), vertexStage(normal), vertexStage(aid))
        const vert = vs(pos, scl, aid)
        return { vert, frag, iMVP }
}
const createChunk = (i = 0, j = 0, k = 0) => {
        let isMeshed = false
        let count = 0
        const id = chunkId(i, j, k)
        const x = i * 16
        const y = j * 16
        const z = k * 16
        const pos = [] as number[]
        const scl = [] as number[]
        let vox: Uint8Array
        const load = (ctx: CanvasRenderingContext2D) => {
                if (isMeshed) return
                const ox = (k & 3) * 1024 + i * 64
                const oy = (k >> 2) * 1024 + j * 64
                const tile = ctx.getImageData(ox, oy, 64, 64).data
                vox = new Uint8Array(CHUNK * CHUNK * CHUNK)
                let p = 0
                solid((x, y, z) => {
                        const px = (z & 3) * 16 + x
                        const py = (z >> 2) * 16 + y
                        const si = Math.floor((py * 64 + px) * 4)
                        vox[p++] = tile[si + 3] > 0.5 ? 1 : 0
                })
                count = greedyMesh(vox, CHUNK, pos, scl).count
                for (let i = 0; i < count; i++) {
                        const j = i * 3
                        pos[j] += x
                        pos[j + 1] += y
                        pos[j + 2] += z
                }
                isMeshed = true
        }
        const dispose = () => {
                vox = undefined as unknown as Uint8Array
                pos.length = scl.length = count = 0
        }
        return { id, x, y, z, pos, scl, load, count: () => count, vox: () => vox, dispose }
}
const withBudget = (budget = 6) => {
        const start = performance.now()
        return () => performance.now() - start < Math.max(0, budget)
}
type FetchTask = {
        start: () => Promise<HTMLImageElement>
        resolve: (img: HTMLImageElement) => void
        priority: number
        started: boolean
        high: boolean
}
const createFetchQueue = (limit = 4, lowLimit = 1) => {
        const high = [] as FetchTask[]
        const low = [] as FetchTask[]
        let activeHigh = 0
        let activeLow = 0
        const sort = (list: FetchTask[]) => list.sort((a, b) => b.priority - a.priority)
        const launch = (task: FetchTask, isHigh = false) => {
                task.started = true
                task.high = isHigh
                isHigh ? activeHigh++ : activeLow++
                task.start()
                        .then((img) => task.resolve(img))
                        .finally(() => {
                                isHigh ? activeHigh-- : activeLow--
                                pump()
                        })
        }
        const pump = () => {
                sort(high)
                sort(low)
                while (activeHigh + activeLow < limit) {
                        if (high.length) {
                                launch(high.shift()!, true)
                                continue
                        }
                        if (!low.length || activeLow >= lowLimit) return
                        launch(low.shift()!, false)
                }
        }
        const enqueue = (start = () => createImage(''), priority = 0) => {
                let resolve = (_img: HTMLImageElement) => {}
                const promise = new Promise<HTMLImageElement>((r) => (resolve = r))
                const task: FetchTask = { start, resolve, priority, started: false, high: priority > 0 }
                const bucket = task.high ? high : low
                bucket.push(task)
                pump()
                return { promise, task }
        }
        const rebucket = (task: FetchTask, target: FetchTask[]) => {
                const src = task.high ? high : low
                const idx = src.indexOf(task)
                if (idx >= 0) src.splice(idx, 1)
                target.push(task)
        }
        const bump = (task: FetchTask | null, priority = 0) => {
                if (!task || task.priority >= priority) return
                task.priority = priority
                const shouldBeHigh = priority > 0
                if (task.started) {
                        if (!task.high && shouldBeHigh) {
                                task.high = true
                                activeLow = Math.max(0, activeLow - 1)
                                activeHigh++
                                pump()
                        }
                        return
                }
                if (task.high !== shouldBeHigh) {
                        rebucket(task, shouldBeHigh ? high : low)
                        task.high = shouldBeHigh
                }
                pump()
        }
        return { schedule: enqueue, bump }
}
const fetchQueue = createFetchQueue()
const createRegion = (mesh: Mesh, i = SCOPE.x0, j = SCOPE.y0) => {
        let img: HTMLImageElement
        let pending: Promise<HTMLImageElement> | null = null
        let queued: FetchTask | null = null
        let ctx: CanvasRenderingContext2D | null = null
        let cursor = 0
        let chunks: Map<number, Chunk> | null = null
        let queue: Chunk[] | null = null
        let disposed = false
        const [x, y, z] = offOf(i, j)
        const ensureChunks = () => {
                if (disposed || (chunks && queue)) return
                chunks = new Map<number, Chunk>()
                queue = []
                solid((ci, cj, ck) => {
                        const c = createChunk(ci, cj, ck)
                        chunks!.set(c.id, c)
                        queue!.push(c)
                })
        }
        const startImage = (priority = 0) => {
                if (disposed) return Promise.resolve(img as HTMLImageElement)
                if (img) return Promise.resolve(img)
                if (!pending) {
                        const { promise, task } = fetchQueue.schedule(() => createImage(`${ATLAS_URL}/${i}_${j}.png`), priority)
                        pending = promise.then((res) => {
                                if (disposed) return res
                                img = res
                                return img
                        })
                        queued = task
                } else {
                        fetchQueue.bump(queued, priority)
                }
                return pending
        }
        const image = async (priority = 0) => img || (await startImage(priority))
        const chunk = (_ctx: CanvasRenderingContext2D, i = 0, budget = 6) => {
                ensureChunks()
                if (!queue || disposed) return true
                const inBudget = withBudget(budget)
                for (; cursor < queue.length; cursor++) {
                        if (!inBudget()) return false
                        const c = queue[cursor]
                        c.load((ctx = _ctx))
                        mesh.merge(c, i)
                }
                return true
        }
        const get = (ci = 0, cj = 0, ck = 0) => (ensureChunks(), chunks?.get(chunkId(ci, cj, ck)))
        const dispose = () => {
                disposed = true
                pending = null
                queued = null
                img = undefined as unknown as HTMLImageElement
                ctx = null
                queue?.forEach((c) => c.dispose())
                queue = null
                chunks?.clear()
                chunks = null
                cursor = 0
                return true
        }
        return {
                id: regionId(i, j),
                i,
                j,
                x,
                y,
                z,
                image,
                chunk,
                get,
                dispose,
                prefetch: (priority = 0) => void startImage(priority),
                ctx: () => ctx,
                cursor: () => (cursor = 0),
                peek: () => img,
                fetching: () => !!pending && !img,
                slot: -1,
        }
}
const REGION_CACHE_LIMIT = 32
const createRegions = (mesh: Mesh, cam: Camera) => {
        const regions = new Map<number, Region>()
        const _ensure = (rx = 0, ry = 0) => {
                const id = regionId(rx, ry)
                const got = regions.get(id)
                if (got) return got
                const r = createRegion(mesh, rx, ry)
                regions.set(id, r)
                return r
        }
        const _coord = () => {
                const start = camOf(cam.pos)
                const list = [{ ...start, d: -1, region: _ensure(start.i, start.j) }]
                const prefetch = new Set<Region>()
                const _tick = (i = 0, j = 0) => {
                        if (i === 0 && j === 0) return
                        i -= SLOT
                        j -= SLOT
                        const d = Math.hypot(i, j)
                        i += start.i
                        j += start.j
                        const [x, y, z] = offOf(i, j)
                        if (!cullRegion(cam.MVP, x, y, z) && d > SLOT) return
                        if (!clampScope(i, j)) return
                        const region = _ensure(i, j)
                        if (d <= SLOT) prefetch.add(region)
                        if (!cullRegion(cam.MVP, x, y, z)) return
                        list.push({ i, j, d, region })
                }
                for (let i = 0; i < SLOT * 2; i++) for (let j = 0; j < SLOT * 2; j++) _tick(i, j)
                list.sort((a, b) => a.d - b.d)
                const keep = list.filter((e) => clampScope(e.i, e.j)).slice(0, SLOT)
                keep.forEach((e) => prefetch.delete(e.region))
                return { keep, prefetch }
        }
        const prune = (active: Set<Region>, origin: { i: number; j: number }) => {
                if (regions.size <= REGION_CACHE_LIMIT) return
                const inactive = Array.from(regions.values()).filter((r) => !active.has(r))
                inactive.sort((a, b) => {
                        const da = Math.hypot(a.i - origin.i, a.j - origin.j)
                        const db = Math.hypot(b.i - origin.i, b.j - origin.j)
                        return db - da
                })
                for (const r of inactive) {
                        if (regions.size <= REGION_CACHE_LIMIT) break
                        regions.delete(r.id)
                        r.dispose()
                }
        }
        const vis = () => {
                const { keep, prefetch } = _coord()
                const keepSet = new Set(keep.map((c) => c.region))
                const active = new Set<Region>(keepSet)
                keepSet.forEach((r) => r.prefetch(2))
                prefetch.forEach((r) => {
                        active.add(r)
                        if (r.fetching()) return
                        r.prefetch(0)
                })
                prune(active, keep[0] ?? { i: SCOPE.x0, j: SCOPE.y0 })
                return keepSet
        }
        const pick = (wx = 0, wy = 0, wz = 0) => {
                const rxi = SCOPE.x0 + Math.floor(wx / REGION)
                const ryj = SCOPE.y1 - Math.floor(wz / REGION)
                if (rxi < SCOPE.x0 || rxi > SCOPE.x1) return 0
                if (ryj < SCOPE.y0 || ryj > SCOPE.y1) return 0
                const rid = regionId(rxi, ryj)
                const r = regions.get(rid)
                if (!r) return 0
                const lx = wx - r.x
                const ly = wy - r.y
                const lz = wz - r.z
                const ci = Math.floor(lx / CHUNK)
                const cj = Math.floor(ly / CHUNK)
                const ck = Math.floor(lz / CHUNK)
                if (ci < 0 || ci > 15 || cj < 0 || cj > 15 || ck < 0 || ck > 15) return 0
                const c = r.get(ci, cj, ck)
                if (!c) return 0
                if (!c.vox()) {
                        const ctx = r.ctx()
                        if (ctx) c.load(ctx)
                }
                if (!c.vox()) return 0
                const vx = Math.floor(lx - ci * CHUNK)
                const vy = Math.floor(ly - cj * CHUNK)
                const vz = Math.floor(lz - ck * CHUNK)
                if (vx < 0 || vx > 15 || vy < 0 || vy > 15 || vz < 0 || vz > 15) return 0
                const idx = vx + (vy + vz * CHUNK) * CHUNK
                return c.vox()[idx]
        }
        return { vis, pick }
}
const createSlot = (index = 0) => {
        const ctx = createContext()!
        let tex: WebGLTexture
        let atlas: WebGLUniformLocation
        let offset: WebGLUniformLocation
        let region: Region | null = null
        let isReady = false
        let pending: HTMLImageElement | null = null
        const reset = () => {
                pending = null
                isReady = false
        }
        const assign = (c: WebGL2RenderingContext, pg: WebGLProgram, img: HTMLImageElement) => {
                ctx.clearRect(0, 0, 4096, 4096)
                ctx.drawImage(img, 0, 0, 4096, 4096)
                if (!atlas) atlas = c.getUniformLocation(pg, `iAtlas${index}`)!
                if (!offset) offset = c.getUniformLocation(pg, `iOffset${index}`)!
                if (!atlas || !offset || !region) return false
                if (!tex) {
                        tex = c.createTexture()
                        c.activeTexture(c.TEXTURE0 + index)
                        c.bindTexture(c.TEXTURE_2D, tex)
                        c.texParameteri(c.TEXTURE_2D, c.TEXTURE_MIN_FILTER, c.LINEAR)
                        c.texParameteri(c.TEXTURE_2D, c.TEXTURE_MAG_FILTER, c.LINEAR)
                        c.texParameteri(c.TEXTURE_2D, c.TEXTURE_WRAP_S, c.CLAMP_TO_EDGE)
                        c.texParameteri(c.TEXTURE_2D, c.TEXTURE_WRAP_T, c.CLAMP_TO_EDGE)
                } else {
                        c.activeTexture(c.TEXTURE0 + index)
                        c.bindTexture(c.TEXTURE_2D, tex)
                }
                c.texImage2D(c.TEXTURE_2D, 0, c.RGBA, c.RGBA, c.UNSIGNED_BYTE, img) // Do not use ctx.canvas, as some img data will be lost
                c.uniform1i(atlas, index)
                c.uniform3fv(offset, new Float32Array([region.x, region.y, region.z]))
                return (isReady = true)
        }
        const upload = (c: WebGL2RenderingContext, pg: WebGLProgram, budget = 6) => {
                if (!pending) return false
                const inBudget = withBudget(budget)
                const ok = assign(c, pg, pending)
                pending = null
                if (!ok || !inBudget()) return false
                return true
        }
        const ready = (c: WebGL2RenderingContext, pg: WebGLProgram, budget = 6) => {
                if (!region) return true
                if (isReady) return true
                const img = pending || region.peek()
                if (!img) {
                        region.prefetch(2)
                        return false
                }
                pending = img
                return upload(c, pg, budget)
        }
        const set = (r: Region, index = 0) => {
                region = r
                region.slot = index
                reset()
        }
        const release = () => {
                if (!region) return
                region.slot = -1
                region = null
                reset()
        }
        return { ready, release, set, ctx: () => ctx, isReady: () => isReady, region: () => region }
}
const createSlots = () => {
        const owner = range(SLOT).map(createSlot)
        let pending = [] as Region[]
        let cursor = 0
        let keep = new Set<Region>()
        const _assign = (c: WebGL2RenderingContext, pg: WebGLProgram, r: Region, budget = 6) => {
                let index = r.slot
                if (index < 0) {
                        index = owner.findIndex((slot) => !slot.region())
                        if (index < 0) return false
                        const slot = owner[index]
                        slot.set(r, index)
                }
                const slot = owner[index]
                if (slot.region() !== r) return false
                if (!slot.ready(c, pg, budget)) return false
                return r.chunk(slot.ctx(), index, budget)
        }
        const _release = (keep: Set<Region>) => {
                owner.forEach((slot) => {
                        if (keep.has(slot.region())) return
                        slot.release()
                })
        }
        const begin = (next: Set<Region>) => {
                _release((keep = next))
                cursor = 0
                pending = Array.from(keep)
                pending.forEach((r) => r.cursor())
        }
        const step = async (c: WebGL2RenderingContext, pg: WebGLProgram, budget = 6) => {
                const start = performance.now()
                const inBudget = withBudget(budget)
                for (; cursor < pending.length; cursor++) {
                        if (!inBudget()) break
                        const dt = Math.max(0, budget - (performance.now() - start))
                        if (!(await _assign(c, pg, pending[cursor], dt))) return false
                }
                return cursor >= pending.length
        }
        return { begin, step }
}
const createMode = () => {
        let mode = -1 // 0 is creative
        let _mode = 1 // last non-pause mode
        const tab = () => {
                if (mode === 0) return (mode = _mode = 1)
                if (mode === 1) return (mode = _mode = 0)
        }
        const esc = () => {
                if (mode === -1) return (mode = _mode = 1)
                if (mode === 2) return (mode = _mode)
                ;[_mode, mode] = [mode, _mode]
                return mode
        }
        return { tab, esc, current: () => mode }
}
const createViewer = () => {
        let isLoading = false
        let ts = performance.now()
        let pt = ts
        let dt = 0
        let pt2 = ts - 200
        const cam = createCamera({ X: (Math.random() * 0.5 + 0.5) * ROW * REGION, Y: 720, Z: (REGION * (SCOPE.y1 - SCOPE.y0 + 1)) / 2 })
        const mesh = createMesh()
        const mode = createMode()
        const node = createNode()
        const slots = createSlots()
        const regions = createRegions(mesh, cam)
        const resize = (gl: GL) => {
                cam.update(gl.size[0] / gl.size[1])
                node.iMVP.value = [...cam.MVP]
        }
        const render = async (gl: GL) => {
                pt = ts
                ts = performance.now()
                dt = Math.min((ts - pt) / 1000, 0.03) // 0.03 is 1 / (30fps)
                cam.tick(dt, regions.pick)
                cam.update(gl.size[0] / gl.size[1])
                node.iMVP.value = [...cam.MVP]
                const c = gl.webgl.context as WebGL2RenderingContext
                const pg = gl.webgl.program as WebGLProgram
                if (!isLoading)
                        if (ts - pt2 >= 100) {
                                pt2 = ts
                                mesh.reset()
                                slots.begin(regions.vis())
                                isLoading = true
                        }
                if (isLoading)
                        if (await slots.step(c, pg, 6)) {
                                mesh.commit()
                                isLoading = false
                        }
                gl.instanceCount = mesh.draw(c, pg)
        }
        return { mode, node, cam, render, resize, pt: 0 }
}
const Canvas = ({ viewer }: { viewer: Viewer }) => {
        const gl = useGL({
                // wireframe: true,
                isWebGL: true,
                isDepth: true,
                // isDebug: true,
                count: 36, // Total number of cube triangles vertices
                instanceCount: 1, // count of instanced mesh in initial state
                vert: viewer.node.vert,
                frag: viewer.node.frag,
                render() {
                        viewer.render(gl)
                },
                resize() {
                        viewer.resize(gl)
                },
                mount() {
                        const el = gl.el
                        const press = (isPress: boolean, e: KeyboardEvent) => {
                                const k = e.code
                                if (k === 'KeyW') viewer.cam.asdw(1, isPress ? 1 : 0)
                                if (k === 'KeyS') viewer.cam.asdw(1, isPress ? -1 : 0)
                                if (k === 'KeyA') viewer.cam.asdw(2, isPress ? 1 : 0)
                                if (k === 'KeyD') viewer.cam.asdw(2, isPress ? -1 : 0)
                                if (k === 'Space') viewer.cam.space(isPress)
                                if (k === 'ArrowUp') viewer.cam.asdw(1, isPress ? 1 : 0)
                                if (k === 'ArrowDown') viewer.cam.asdw(1, isPress ? -1 : 0)
                                if (k === 'ArrowLeft') viewer.cam.asdw(2, isPress ? 1 : 0)
                                if (k === 'ArrowRight') viewer.cam.asdw(2, isPress ? -1 : 0)
                                if (k === 'MetaLeft') viewer.cam.shift(isPress)
                                if (k === 'MetaRight') viewer.cam.shift(isPress)
                                if (k === 'ShiftLeft') viewer.cam.shift(isPress)
                                if (k === 'ShiftRight') viewer.cam.shift(isPress)
                                if (k === 'ControlLeft') viewer.cam.shift(isPress)
                                if (k === 'ControlRight') viewer.cam.shift(isPress)
                                if (k === 'Tab' && isPress) {
                                        e.preventDefault()
                                        viewer.cam.mode(viewer.mode.tab())
                                }
                        }
                        const onMove = (e: MouseEvent) => {
                                viewer.cam.turn([-e.movementX, -e.movementY])
                        }
                        const onLock = () => {
                                viewer.pt = performance.now()
                                viewer.cam.mode(viewer.mode.esc())
                        }
                        const onDown = () => {
                                if (!el) return
                                const ts = performance.now()
                                if (ts - viewer.pt < 2000) return
                                viewer.pt = ts
                                setTimeout(() => {
                                        try {
                                                el.requestPointerLock()
                                        } finally {
                                        }
                                }, 1000)
                        }
                        el.addEventListener('mousedown', onDown)
                        window.addEventListener('keyup', press.bind(null, false))
                        window.addEventListener('keydown', press.bind(null, true))
                        document.addEventListener('mousemove', onMove)
                        document.addEventListener('pointerlockchange', onLock)
                },
        })
        return <canvas ref={gl.ref} style={{ top: 0, left: 0, position: 'absolute', background: '#212121', width: '100%', height: '100%' }} />
}
export default function Home() {
        const [viewer, set] = useState<Viewer>()
        useEffect(() => void set(createViewer()), [])
        return <Layout noFooter>{viewer ? <Canvas viewer={viewer} /> : null}</Layout>
}
type Camera = ReturnType<typeof createCamera>
type Chunk = ReturnType<typeof createChunk>
type Mesh = ReturnType<typeof createMesh>
type Slot = ReturnType<typeof createSlot>
type Region = ReturnType<typeof createRegion>
type Viewer = ReturnType<typeof createViewer>
