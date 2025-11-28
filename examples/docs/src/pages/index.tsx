// @ts-ignore
import Layout from '@theme/Layout'
import { useGL } from 'glre/src/react'
import { attribute, float, Fn, If, instance, int, ivec2, mat4, texelFetch, texture2D, uniform, vec3, vec4, vertexStage } from 'glre/src/node'
import { vec3 as V, mat4 as M } from 'gl-matrix'
import { useEffect, useState } from 'react'
import type { GL } from 'glre/src'
import type { Float, IVec2, Vec3 } from 'glre/src/node'
const SCOPE = { x0: 28, x1: 123, y0: 75, y1: 79 }
const ROW = SCOPE.x1 - SCOPE.x0 + 1 // 96 region = 96×16×16 voxel [m]
const SLOT = 16
const CHUNK = 16
const CACHE = 32
const REGION = 256
const PREFETCH = 16
const LIGHT_DIR = [-0.33, 0.77, 0.55]
const ATLAS_URL = `https://pub-a3916cfad25545dc917e91549e7296bc.r2.dev/v1` // `http://localhost:5173/logs`
const scoped = (i = 0, j = 0) => SCOPE.x0 <= i && i <= SCOPE.x1 && SCOPE.y0 <= j && j <= SCOPE.y1
const offOf = (i = SCOPE.x0, j = SCOPE.y0) => ({ x: REGION * (i - SCOPE.x0), y: 0, z: REGION * (SCOPE.y1 - j) })
const posOf = (pos = V.create()) => ({ i: SCOPE.x0 + Math.floor(pos[0] / REGION), j: SCOPE.y1 - Math.floor(pos[1] / REGION) })
const range = (n = 0) => [...Array(n).keys()]
const chunkId = (i = 0, j = 0, k = 0) => i + j * CHUNK + k * CHUNK * CHUNK
const regionId = (i = 0, j = 0) => i + 160 * j // DO NOT CHANGE
const culling = (VP = M.create(), rx = 0, ry = 0, rz = 0) => visSphere(VP, rx + 128, ry + 128, rz + 128, Math.sqrt(256 * 256 * 3) * 0.5)
const solid = (f: (i: number, j: number, k: number) => void, n = CHUNK) => {
        for (let k = 0; k < n; k++) for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) f(i, j, k)
}
const timer = (t = 6) => {
        const start = performance.now()
        return () => performance.now() - start < Math.max(0, t)
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
const visSphere = (m = M.create(), cx = 0, cy = 0, cz = 0, r = 1) => {
        const t = (ax = 0, ay = 0, az = 0, aw = 0) => (ax * cx + ay * cy + az * cz + aw) / (Math.hypot(ax, ay, az) || 1) + r < 0
        if (t(m[3] + m[0], m[7] + m[4], m[11] + m[8], m[15] + m[12])) return false
        if (t(m[3] - m[0], m[7] - m[4], m[11] - m[8], m[15] - m[12])) return false
        if (t(m[3] + m[1], m[7] + m[5], m[11] + m[9], m[15] + m[13])) return false
        if (t(m[3] - m[1], m[7] - m[5], m[11] - m[9], m[15] - m[13])) return false
        if (t(m[3] + m[2], m[7] + m[6], m[11] + m[10], m[15] + m[14])) return false
        if (t(m[3] - m[2], m[7] - m[6], m[11] - m[10], m[15] - m[14])) return false
        return true
}
const greedyMesh = (src: Uint8Array, size = 1, pos: number[] = [], scl: number[] = [], count = 0) => {
        const data = new Uint8Array(src)
        const index = (x = 0, y = 0, z = 0) => x + (y + z * size) * size
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
const _fwd = V.fromValues(0, 0, -1)
const _up = V.fromValues(0, 1, 0)
const _t0 = V.create()
const _t1 = V.create()
const _t2 = M.create()
const _t3 = M.create()
const clampToFace = (pos = 0, half = 0.5, sign = 0, base = Math.floor(pos)) => (sign > 0 ? Math.min(pos, base + 1 - half) : Math.max(pos, base + half))
const lookAt = (eye = V.create(), pos = V.create(), face = V.create()) => V.scaleAndAdd(eye, pos, face, 10)
const faceDir = (out = V.create(), yaw = 0, pitch = 0) => {
        M.identity(_t2)
        M.rotateY(_t2, _t2, yaw)
        M.rotateX(_t2, _t2, pitch)
        V.transformMat4(out, _fwd, _t2)
        return out
}
const moveDir = (out = V.create(), dir = V.create(), speed = 1, planar = false) => {
        V.copy(_t1, out)
        _t1[1] = 0
        if (V.squaredLength(_t1) < 1e-8) {
                _t1[0] = _t1[1] = 0
                _t1[2] = -1
        }
        V.normalize(_t1, _t1)
        V.cross(_t0, _up, _t1)
        V.normalize(_t0, _t0)
        const fwd = planar ? _t1 : out
        V.scale(_t0, _t0, dir[0])
        V.scale(_t1, fwd, dir[2])
        V.add(out, _t0, _t1)
        V.scale(out, out, speed)
        return out
}
const perspective = (MVP = M.create(), pos = V.create(), eye = V.create(), aspect = 1, offsetY = 0) => {
        M.perspective(_t2, (28 * Math.PI) / 180, aspect, 0.1, 4000)
        V.copy(_t0, pos)
        V.copy(_t1, eye)
        _t0[1] += offsetY
        _t1[1] += offsetY
        M.lookAt(_t3, _t0, _t1, _up)
        M.multiply(MVP, _t2, _t3)
}
const createCamera = ({ yaw = Math.PI * 0.5, pitch = -Math.PI * 0.45, mode = -1, X = 0, Y = 0, Z = 0, DASH = 3, MOVE = 12, JUMP = 12, GROUND = 0, SIZE = [0.8, 1.8, 0.8], GRAVITY = -50, TURN = 1 / 250 }) => {
        let dash = 1
        let scroll = 0
        let isGround = false
        const MVP = M.create()
        const pos = V.fromValues(X, Y, Z)
        const eye = V.fromValues(X - 10, Y, Z)
        const vel = V.fromValues(0, 0, 0)
        const dir = V.fromValues(0, 0, 0)
        const face = V.fromValues(-1, 0, 0)
        const asdw = (axis = 0, delta = 0) => {
                if (axis === 0) return void (dir[1] = delta)
                if (axis === 1) return void (dir[2] = delta)
                if (axis === 2) return void (dir[0] = delta)
        }
        const shift = (isPress = true) => {
                if (mode === 0) return asdw(0, isPress ? -1 : 0)
                if (mode === 1) return void (dash = isPress ? DASH : 1)
        }
        const space = (isPress = true) => {
                if (mode === 0) return asdw(0, isPress ? 1 : 0)
                if (mode === 1 && isGround && isPress) return void (vel[1] = JUMP)
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
                const xyz = V.clone(pos)
                xyz[axis] += s
                if (!pick(...V.floor(xyz, xyz))) return
                if (axis === 1 && s < 0) isGround = true
                pos[axis] = clampToFace(pos[axis], SIZE[axis] * 0.5, s)
                vel[axis] = 0
        }
        const tick = (dt = 0, pick = (_x = 0, _y = 0, _z = 0) => 0) => {
                if (mode === 2) return
                if (mode === -1) {
                        scroll -= dt * MOVE
                        pos[0] = X + scroll
                        if (pos[0] < 0) pos[0] = ROW * REGION
                        if (pos[0] > ROW * REGION) pos[0] = 0
                        lookAt(eye, pos, face)
                }
                const speed = MOVE * dash * (mode === 0 ? 20 : 1)
                const move = moveDir(V.clone(face), dir, speed, mode === 1)
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
                        let steps = Math.ceil((vmax * dt) / 0.25) // 0.25 step size
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
                        if (pos[1] < GROUND) void ((pos[1] = Y / 4), (vel[1] = 0))
                }
                lookAt(eye, pos, face)
        }
        faceDir(face, yaw, pitch)
        lookAt(eye, pos, face)
        return { pos, MVP, tick, turn, shift, space, asdw, mode: (x = 0) => (mode = x), update: (aspect = 1) => perspective(MVP, pos, eye, aspect, SIZE[1] * 0.5) }
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
        let isReady = false
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
        const merge = (c: Chunk, index = 0) => {
                _count += c.count()
                _pos.push(...c.pos)
                _scl.push(...c.scl)
                for (let i = 0; i < c.count(); i++) _aid.push(index)
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
        const reset = () => {
                _pos.length = _scl.length = _aid.length = _count = 0
        }
        const commit = () => {
                if (!_count) return false
                ;[pos, _pos, scl, _scl, aid, _aid, count] = [_pos, pos, _scl, scl, _aid, aid, _count]
                reset()
                isReady = true
                return true
        }
        return { merge, draw, reset, commit, count: () => count, isReady: () => isReady }
}
const createNode = () => {
        const iMVP = uniform<'mat4'>(mat4(), 'iMVP')
        const iAtlas = range(SLOT).map((i) => uniform(texture2D(), `iAtlas${i}`))
        const iOffset = range(SLOT).map((i) => uniform(vec3(0, 0, 0), `iOffset${i}`))
        const vertex = attribute<'vec3'>([-0.5, -0.5, -0.5, -0.5, -0.5, 0.5, -0.5, 0.5, 0.5, -0.5, 0.5, 0.5, -0.5, 0.5, -0.5, -0.5, -0.5, -0.5, 0.5, -0.5, 0.5, 0.5, -0.5, -0.5, 0.5, 0.5, -0.5, 0.5, 0.5, -0.5, 0.5, 0.5, 0.5, 0.5, -0.5, 0.5, -0.5, -0.5, -0.5, 0.5, -0.5, -0.5, 0.5, -0.5, 0.5, 0.5, -0.5, 0.5, -0.5, -0.5, 0.5, -0.5, -0.5, -0.5, -0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, -0.5, 0.5, 0.5, -0.5, -0.5, 0.5, -0.5, -0.5, 0.5, 0.5, 0.5, -0.5, -0.5, -0.5, -0.5, -0.5, -0.5, 0.5, -0.5, -0.5, 0.5, -0.5, 0.5, 0.5, -0.5, 0.5, -0.5, -0.5, -0.5, -0.5, 0.5, 0.5, -0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, -0.5, 0.5, 0.5, -0.5, -0.5, 0.5], 'vertex')
        const normal = attribute<'vec3'>([-1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1], 'normal')
        const scl = instance<'vec3'>(vec3(), 'scl')
        const pos = instance<'vec3'>(vec3(), 'pos')
        const aid = instance<'float'>(float(), 'aid')
        const atlas = Fn(([p, n]: [Vec3, Vec3]) => {
                const wp = p.sub(n.sign().mul(0.5)).floor().toIVec3().toVar('wp') // world pos
                const ci = wp.div(int(16)).toIVec3().mul(int(16)).toVar('ci') // left shift like k & 3
                const lp = wp.sub(ci).toIVec3().toVar('lp') // ................ right shift like k >> 2
                const a = int(ci.z.div(int(64))).toVar('a')
                const b = int(ci.z.div(int(16)).sub(a.mul(int(4)))).toVar('b')
                const c = int(lp.z.div(int(4))).toVar('c')
                const d = int(lp.z.sub(c.mul(int(4)))).toVar('d')
                const zt = ivec2(b, a).mul(int(1024))
                const lt = ivec2(d, c).mul(int(16)).add(lp.xy)
                return int(4).mul(ci.xy).add(zt).add(lt).toVec2()
        })
        const pick = Fn(([id, uvPix]: [Float, IVec2]) => {
                const t = vec4(0, 0, 0, 1).toVar('t')
                range(SLOT).map((i) => {
                        If(id.equal(i), () => {
                                t.assign(texelFetch(iAtlas[i], uvPix, int(0)))
                        })
                })
                return t
        })
        const world = Fn(([vertex, scl, pos]: [Vec3, Vec3, Vec3]) => {
                return vertex.mul(scl).add(pos)
        })
        const shade = Fn(([normal]: [Vec3]) => {
                return normal.normalize().dot(vec3(LIGHT_DIR).normalize()).mul(0.5).add(0.5)
        })
        const fs = Fn(([p, n, diffuse, i]: [Vec3, Vec3, Float, Float]) => {
                const uv = atlas(p, n).floor().toIVec2().toVar('uv')
                const rgb = pick(i, uv).rgb.mul(diffuse).toVar('rgb')
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
        const frag = fs(vertexStage(world(vertex, scl, pos)), vertexStage(normal), vertexStage(shade(normal)), vertexStage(aid))
        const vert = vs(pos, scl, aid)
        return { vert, frag, iMVP }
}
const createChunk = (i = 0, j = 0, k = 0) => {
        let isMeshed = false
        let count = 0
        let vox: Uint8Array
        const id = chunkId(i, j, k)
        const x = i * 16
        const y = j * 16
        const z = k * 16
        const pos = [] as number[]
        const scl = [] as number[]
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
                isMeshed = false
                vox = undefined as unknown as Uint8Array
                pos.length = scl.length = count = 0
        }
        return { id, x, y, z, pos, scl, load, dispose, count: () => count, vox: () => vox }
}
const createQueue = () => {
        const items = [] as Task[]
        const sort = () => void items.sort((a, b) => b.priority - a.priority)
        const add = (task: Task) => items.push(task)
        const shift = () => items.shift()
        const remove = (task: Task) => {
                const index = items.indexOf(task)
                if (index >= 0) items.splice(index, 1)
        }
        return { add, shift, sort, remove, size: () => items.length }
}
const createQueues = (limit = 4, lowLimit = 1) => {
        let _high = 0
        let _low = 0
        const high = createQueue()
        const low = createQueue()
        const _finally = (isHigh = true) => {
                if (isHigh) _high--
                else _low--
                _pump()
        }
        const _launch = (task: Task, isHigh = false) => {
                task.started = true
                task.isHigh = isHigh
                if (isHigh) _high++
                else _low++
                task.start()
                        .then((x) => task.resolve(x))
                        .finally(() => _finally(isHigh))
        }
        const _pump = () => {
                const tick = () => {
                        high.sort()
                        low.sort()
                        if (_high + _low >= limit) return
                        if (high.size() > 0) {
                                const task = high.shift()!
                                _launch(task, true)
                                return tick()
                        }
                        if (low.size() <= 0 || _low >= lowLimit) return
                        _launch(low.shift()!, false)
                        return tick()
                }
                tick()
        }
        const _bucket = (task: Task, target: Queue) => {
                ;(task.isHigh ? high : low).remove(task)
                target.add(task)
        }
        const schedule = (start = () => createImage(''), priority = 0) => {
                let resolve = (_img: HTMLImageElement) => {}
                const promise = new Promise<HTMLImageElement>((r) => (resolve = r))
                const task = { start, resolve, priority, started: false, isHigh: priority > 0 }
                ;(task.isHigh ? high : low).add(task)
                _pump()
                return { promise, task }
        }
        const bump = (task?: Task, priority = 0) => {
                if (!task || task.priority >= priority) return
                const isHigh = priority > 0
                task.priority = priority
                if (task.started) {
                        if (!task.isHigh && isHigh) {
                                task.isHigh = true
                                _low = Math.max(0, _low - 1)
                                _high++
                                _pump()
                        }
                        return
                }
                if (task.isHigh !== isHigh) {
                        _bucket(task, isHigh ? high : low)
                        task.isHigh = isHigh
                }
                _pump()
        }
        return { schedule, bump }
}
const createRegion = (mesh: Mesh, i = SCOPE.x0, j = SCOPE.y0, queues: Queues) => {
        let isDisposed = false
        let cursor = 0
        let pending: Promise<HTMLImageElement>
        let chunks: Map<number, Chunk>
        let queued: Task
        let queue: Chunk[]
        let img: HTMLImageElement
        let ctx: CanvasRenderingContext2D
        const _ensure = () => {
                if (isDisposed || (chunks && queue)) return
                chunks = new Map<number, Chunk>()
                queue = []
                solid((ci, cj, ck) => {
                        const c = createChunk(ci, cj, ck)
                        chunks!.set(c.id, c)
                        queue!.push(c)
                })
        }
        const prefetch = (priority = 0) => {
                if (isDisposed || img) return Promise.resolve(img)
                if (!pending) {
                        const { promise, task } = queues.schedule(() => createImage(`${ATLAS_URL}/${i}_${j}.png`), priority)
                        pending = promise.then((res) => {
                                if (isDisposed) return res
                                return (img = res)
                        })
                        queued = task
                } else queues.bump(queued, priority)
                return pending
        }
        const image = async (priority = 0) => img || (await prefetch(priority))
        const chunk = (_ctx: CanvasRenderingContext2D, i = 0, budget = 6) => {
                _ensure()
                if (!queue || isDisposed) return true
                const checker = timer(budget)
                for (; cursor < queue.length; cursor++) {
                        if (!checker()) return false
                        const c = queue[cursor]
                        c.load((ctx = _ctx))
                        mesh.merge(c, i)
                }
                return true
        }
        const get = (ci = 0, cj = 0, ck = 0) => {
                _ensure()
                return chunks?.get(chunkId(ci, cj, ck))
        }
        const dispose = () => {
                isDisposed = true
                queue?.forEach((c) => c.dispose())
                chunks?.clear()
                queue = void 0 as unknown as Chunk[]
                chunks = void 0 as unknown as Map<number, Chunk>
                pending = void 0 as unknown as Promise<HTMLImageElement>
                queued = void 0 as unknown as Task
                img = void 0 as unknown as HTMLImageElement
                ctx = void 0 as unknown as CanvasRenderingContext2D
                cursor = 0
                return true
        }
        return { id: regionId(i, j), ...offOf(i, j), i, j, image, chunk, get, dispose, prefetch, ctx: () => ctx, cursor: () => (cursor = 0), peek: () => img, fetching: () => !!pending && !img, slot: -1 }
}
const createRegions = (mesh: Mesh, cam: Camera, queues: Queues) => {
        const regions = new Map<number, Region>()
        const _ensure = (rx = 0, ry = 0) => {
                const id = regionId(rx, ry)
                const got = regions.get(id)
                if (got) return got
                const r = createRegion(mesh, rx, ry, queues)
                regions.set(r.id, r)
                return r
        }
        const _coord = () => {
                const start = posOf(cam.pos)
                const list = [{ ...start, d: -1, region: _ensure(start.i, start.j) }]
                const prefetch = new Set<Region>()
                const _tick = (i = 0, j = 0) => {
                        if (i === 0 && j === 0) return
                        i -= PREFETCH
                        j -= PREFETCH
                        const d = Math.hypot(i, j)
                        i += start.i
                        j += start.j
                        const { x, y, z } = offOf(i, j)
                        if (!culling(cam.MVP, x, y, z) && d > SLOT) return
                        if (!scoped(i, j)) return
                        const region = _ensure(i, j)
                        if (d <= SLOT) if (mesh.isReady()) prefetch.add(region)
                        if (!culling(cam.MVP, x, y, z)) return
                        list.push({ i, j, d, region })
                }
                for (let i = 0; i < PREFETCH * 2; i++) for (let j = 0; j < PREFETCH * 2; j++) _tick(i, j)
                list.sort((a, b) => a.d - b.d)
                const keep = list.filter((e) => scoped(e.i, e.j)).slice(0, SLOT)
                keep.forEach((e) => prefetch.delete(e.region))
                return { keep, prefetch }
        }
        const _prune = (active: Set<Region>, origin: { i: number; j: number }) => {
                if (regions.size <= CACHE) return
                const inactive = Array.from(regions.values()).filter((r) => !active.has(r))
                inactive.sort((a, b) => {
                        const da = Math.hypot(a.i - origin.i, a.j - origin.j)
                        const db = Math.hypot(b.i - origin.i, b.j - origin.j)
                        return db - da
                })
                for (const r of inactive) {
                        if (regions.size <= CACHE) break
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
                if (keep[0]) _prune(active, keep[0]) // keep[0] is the closest region
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
        let region: Region
        let isReady = false
        let pending: HTMLImageElement
        const reset = () => {
                pending = void 0 as unknown as HTMLImageElement
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
                const checker = timer(budget)
                const ok = assign(c, pg, pending)
                pending = void 0 as unknown as HTMLImageElement
                if (!ok || !checker()) return false
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
                region = void 0 as unknown as Region
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
        const step = (c: WebGL2RenderingContext, pg: WebGLProgram, budget = 6) => {
                const start = performance.now()
                const inBudget = timer(budget)
                for (; cursor < pending.length; cursor++) {
                        if (!inBudget()) break
                        const dt = Math.max(0, budget - (performance.now() - start))
                        if (!_assign(c, pg, pending[cursor], dt)) return false
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
        const queues = createQueues()
        const regions = createRegions(mesh, cam, queues)
        try {
                cam.update(1280 / 800) // Ensure MVP is valid for culling before first render.
                regions.vis()
        } catch {}
        const resize = (gl: GL) => {
                cam.update(gl.size[0] / gl.size[1])
                node.iMVP.value = [...cam.MVP]
        }
        const render = (gl: GL) => {
                pt = ts
                ts = performance.now()
                dt = Math.min((ts - pt) / 1000, 0.03) // 0.03 is 1 / (30fps)
                if (mesh.isReady()) {
                        cam.tick(dt, regions.pick)
                        cam.update(gl.size[0] / gl.size[1])
                        node.iMVP.value = [...cam.MVP]
                }
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
                        if (slots.step(c, pg, 6)) {
                                mesh.commit()
                                isLoading = false
                        }
                gl.instanceCount = mesh.draw(c, pg)
        }
        return { mode, node, cam, render, resize, pt: 0 }
}
const Canvas = ({ viewer }: { viewer: Viewer }) => {
        const gl = useGL({
                precision: 'highp',
                // el: canvas,
                // wireframe: true,
                isWebGL: true,
                isDepth: true,
                isDebug: true,
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
                        if (!el) return
                        const isSP = window.innerWidth <= 768
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
                        let px = 0
                        let py = 0
                        const onTouch = (e: TouchEvent) => {
                                if (e.touches.length !== 1) return
                                e.preventDefault()
                                const touch = e.touches[0]
                                const x = touch.clientX
                                const y = touch.clientY
                                const dx = x - px
                                const dy = y - py
                                viewer.cam.turn([-dx * 0.2, -dy * 0.2])
                        }
                        const onLock = () => {
                                viewer.pt = performance.now()
                                viewer.cam.mode(viewer.mode.esc())
                        }
                        const onDown = (trial = 0) => {
                                if (!el) return
                                if (trial > 20) return
                                if (performance.now() - viewer.pt < 1300) return setTimeout(() => onDown(trial + 1), 100) // if the user requests within 1250 ms of escaping, the following error occurs: `ERROR: The user has exited the lock before this request was completed.`
                                try {
                                        document.body.requestPointerLock()
                                } finally {
                                }
                        }
                        if (isSP) {
                                document.addEventListener('touchmove', onTouch, { passive: false })
                                document.addEventListener('mousemove', onMove, { passive: false })
                        } else {
                                if (el) el.addEventListener('mousedown', onDown.bind(null, 0))
                                document.addEventListener('mousemove', onMove)
                                window.addEventListener('keyup', press.bind(null, false))
                                window.addEventListener('keydown', press.bind(null, true))
                                document.addEventListener('pointerlockchange', onLock)
                        }
                },
        })
        return <canvas ref={gl.ref} style={{ top: 0, left: 0, position: 'absolute', background: '#212121', width: '100%', height: '100%' }} />
}
export default function Home() {
        const [viewer, set] = useState<Viewer>()
        useEffect(() => void set(createViewer()), [])
        return <Layout noFooter>{viewer ? <Canvas viewer={viewer} /> : null}</Layout>
}
type Task = {
        start: () => Promise<HTMLImageElement>
        resolve: (img: HTMLImageElement) => void
        priority: number
        started: boolean
        isHigh: boolean
}
type Camera = ReturnType<typeof createCamera>
type Chunk = ReturnType<typeof createChunk>
type Mesh = ReturnType<typeof createMesh>
type Queue = ReturnType<typeof createQueue>
type Queues = ReturnType<typeof createQueues>
type Region = ReturnType<typeof createRegion>
type Viewer = ReturnType<typeof createViewer>
