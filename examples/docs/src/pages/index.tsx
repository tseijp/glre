// @ts-ignore
import Layout from '@theme/Layout'
import * as m from 'gl-matrix'
import { useEffect, useState } from 'react'
import { GL, useGL } from 'glre/src/react'
import { attribute, uniform, vec4, vec3, Fn, vertexStage, instance, float, vec2, texture, clamp, If } from 'glre/src/node'
import type { Float, Vec2, Vec3 } from 'glre/src/node'
const RX0 = 28
const RX1 = 123
const RY0 = 75
const RY1 = 79
const ROW = RX1 - RX0 + 1 // 96 region = 96×16×16 voxel
const FAR = Math.sqrt(256 * 256 * 3) * 0.5
const SLOT = 16
const CHUNK = 16
const GROUND = 0
const REGION = 256
const GRAVITY = -50
const MOVE_SPEED = 12
const TURN_SPEED = 1 / 500
const JUMP_SPEED = 12
const DASH_SPEED = 2.5
const CAMERA_X = (Math.random() * 0.5 + 0.5) * ROW * REGION // 256
const CAMERA_Y = 800
const CAMERA_Z = (REGION * (RY1 - RY0 + 1)) / 2
const CAMERA_YAW = Math.PI * 0.5
const CAMERA_PITCH = -Math.PI * 0.45
const CAMERA_SPEED = 10
const LIGHT = [-0.33, 0.77, 0.55] // normalized afternoon sun
const clampRegion = (i = 0, j = 0) => RX0 <= i && i <= RX1 && RY0 <= j && j <= RY1
const urlOfFrame = (rx = 0, ry = 0) => `https://pub-a3916cfad25545dc917e91549e7296bc.r2.dev/v1/${rx}_${ry}.png` //  `http://localhost:5173/logs/${rx}_${ry}.png`
const offOf = (i = RX0, j = RY0) => [REGION * (i - RX0), 0, REGION * (RY1 - j)]
const camOf = (pos = m.vec3.create()) => ({ i: RX0 + Math.floor(pos[0] / REGION), j: RY1 - Math.floor(pos[1] / REGION) })
const range = (n = 0) => [...Array(n).keys()]
const chunkId = (i = 0, j = 0, k = 0) => i + j * CHUNK + k * CHUNK * CHUNK
const regionId = (i = 0, j = 0) => i + 160 * j // DO NOT CHANGE
const cullChunk = (VP = m.mat4.create(), rx = 0, ry = 0, rz = 0, cx = 0, cy = 0, cz = 0) => visSphere(VP, rx + cx + 8, ry + cy + 8, rz + cz + 8, FAR)
const cullRegion = (VP = m.mat4.create(), rx = 0, ry = 0, rz = 0) => visSphere(VP, rx + 128, ry + 128, rz + 128, FAR)
const solid = (f: (i: number, j: number, k: number) => void, n = CHUNK) => {
        for (let k = 0; k < n; k++) for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) f(i, j, k)
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
const _rot = m.mat4.create()
const _up = m.vec3.fromValues(0, 1, 0)
const _t0 = m.vec3.create()
const _t1 = m.vec3.create()
const _P = m.mat4.create()
const _V = m.mat4.create()
const clampToFace = (pos = 0, half = 0.5, sign = 0, base = Math.floor(pos)) => (sign > 0 ? Math.min(pos, base + 1 - half) : Math.max(pos, base + half))
const lookAt = (eye = m.vec3.create(), pos = m.vec3.create(), face = m.vec3.create()) => m.vec3.scaleAndAdd(eye, pos, face, 10)
const faceDir = (out = m.vec3.create(), yaw = 0, pitch = 0) => {
        m.mat4.identity(_rot)
        m.mat4.rotateY(_rot, _rot, yaw)
        m.mat4.rotateX(_rot, _rot, pitch)
        m.vec3.transformMat4(out, _fwd, _rot)
        return out
}
const moveDir = (out = m.vec3.create(), dir = m.vec3.create(), speed: number, planar = false) => {
        m.vec3.copy(_t1, out)
        _t1[1] = 0
        if (m.vec3.squaredLength(_t1) < 1e-8) {
                _t1[0] = 0
                _t1[1] = 0
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
const perspective = (MVP = m.mat4.create(), pos = m.vec3.create(), eye = m.vec3.create(), aspect = 1) => {
        m.mat4.perspective(_P, (28 * Math.PI) / 180, aspect, 0.1, 4000)
        m.mat4.lookAt(_V, pos, eye, _up)
        m.mat4.multiply(MVP, _P, _V)
}
const createCamera = () => {
        let x = 0
        let yaw = CAMERA_YAW
        let pitch = CAMERA_PITCH
        let speed = 1
        let mode = -1 // 0 is creative
        let _mode = 1 // last non-pause mode
        let isGround = false
        const MVP = m.mat4.create()
        const eye = m.vec3.fromValues(CAMERA_X - 10, CAMERA_Y, CAMERA_Z)
        const pos = m.vec3.fromValues(CAMERA_X, CAMERA_Y, CAMERA_Z)
        const vel = m.vec3.fromValues(0, 0, 0)
        const dir = m.vec3.fromValues(0, 0, 0)
        const face = m.vec3.fromValues(-1, 0, 0)
        const size = m.vec3.fromValues(0.8, 1.8, 0.8)
        const turn = (delta: number[]) => {
                const r = mode === 1 ? 1 : 0.1
                yaw += delta[0] * r
                pitch += delta[1] * r
                pitch = Math.min(pitch, Math.PI / 2 - 0.01)
                pitch = Math.max(pitch, -Math.PI / 2 + 0.01)
                faceDir(face, yaw, pitch)
                lookAt(eye, pos, face)
        }
        const jump = (x = 0) => {
                if (mode === 0) vel[1] = x
                if (mode === 1 && isGround) vel[1] = x
        }
        const collide = (axis = 0, pick = (_x = 0, _y = 0, _z = 0) => 0) => {
                const v = vel[axis]
                if (!v) return
                const s = Math.sign(v)
                const xyz = m.vec3.clone(pos)
                xyz[axis] += s
                if (!pick(...m.vec3.floor(xyz, xyz))) return
                if (axis === 1 && s < 0) isGround = true
                pos[axis] = clampToFace(pos[axis], size[axis] * 0.5, s)
                vel[axis] = 0
        }
        const tab = () => {
                if (mode === 0) return (mode = _mode = 1)
                if (mode === 1) return (mode = _mode = 0)
        }
        const esc = () => {
                if (mode === -1) return (mode = _mode = 1)
                if (mode === 2) return (mode = _mode)
                ;[_mode, mode] = [mode, _mode]
        }
        const tick = (dt = 0, pick = (_x = 0, _y = 0, _z = 0) => 0) => {
                if (mode === 2) return
                if (mode === -1) {
                        x -= dt * CAMERA_SPEED
                        pos[0] = CAMERA_X + x
                        if (pos[0] < 0) pos[0] = ROW * REGION
                        if (pos[0] > ROW * REGION) pos[0] = 0
                        lookAt(eye, pos, face)
                }
                const sp = MOVE_SPEED * speed * (mode === 0 ? 20 : 1)
                const move = moveDir(m.vec3.clone(face), dir, sp, mode === 1)
                vel[0] = move[0]
                vel[2] = move[2]
                if (mode === 0) {
                        pos[0] += vel[0] * dt
                        pos[1] += dir[1] * dt * sp
                        pos[2] += vel[2] * dt
                }
                if (mode === 1) {
                        vel[1] += GRAVITY * dt
                        const steps = Math.ceil(dt * Math.max(Math.max(...vel), -Math.min(...vel)))
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
                        if (pos[1] < GROUND) void ((pos[1] = CAMERA_Y), (vel[1] = 0))
                }
                lookAt(eye, pos, face)
        }
        const asdw = (axis = 0, delta = 0) => {
                // axis: 0 -> vertical, 1 -> forward/back, 2 -> left/right
                if (axis === 0) dir[1] = delta
                if (axis === 1) dir[2] = delta
                if (axis === 2) dir[0] = -delta
        }
        faceDir(face, yaw, pitch)
        lookAt(eye, pos, face)
        return { pos, MVP, tick, perspective, turn, jump, asdw, tab, esc, mode: (x = 0) => (mode = x), speed: (x = 0) => (speed = x), update: perspective.bind(null, MVP, pos, eye) }
}
const createMesh = () => {
        let count = 1
        const pos = [0, 0, 0]
        const scl = [1, 1, 1]
        const aid = [0]
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
                pos.length = scl.length = aid.length = count = 0
        }
        const merge = (c: Chunk, index = 0) => {
                count += c.count()
                pos.push(...c.pos)
                scl.push(...c.scl)
                for (let i = 0; i < c.count(); i++) aid.push(index)
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
        return { pos, scl, aid, reset, merge, draw, count: () => count }
}
const createSlot = (index = 0) => {
        const ctx = createContext()!
        let tex: WebGLTexture
        let atlas: WebGLUniformLocation
        let offset: WebGLUniformLocation
        let region: Region
        const assign = (c: WebGL2RenderingContext, pg: WebGLProgram, img: HTMLImageElement) => {
                ctx.clearRect(0, 0, 4096, 4096)
                ctx.drawImage(img, 0, 0, 4096, 4096)
                if (!atlas) atlas = c.getUniformLocation(pg, `iAtlas${index}`)!
                if (!offset) offset = c.getUniformLocation(pg, `iOffset${index}`)!
                if (!atlas || !offset) return
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
        }
        const set = (r: Region, index = 0) => {
                region = r
                region.slot = index
        }
        const release = () => {
                if (!region) return
                region.slot = -1
                region = void 0 as unknown as Region
        }
        return { assign, release, set, ctx: () => ctx, region: () => region }
}
const createSlots = () => {
        const owner = range(SLOT).map(createSlot)
        const _assign = async (c: WebGL2RenderingContext, pg: WebGLProgram, r: Region) => {
                let index = r.slot
                if (index < 0) {
                        index = owner.findIndex((slot) => !slot?.region())
                        if (index < 0) return
                        const slot = owner[index]
                        slot.set(r, index)
                        const img = await r.image()
                        if (owner[index].region() !== r || r.slot !== index) return
                        slot.assign(c, pg, img)
                }
                if (owner[index]) r.chunk(owner[index].ctx(), index)
        }
        const _release = (keep: Set<Region>) => {
                owner.forEach((slot) => {
                        if (!slot || keep.has(slot.region())) return
                        slot.release()
                })
        }
        const sync = async (c: WebGL2RenderingContext, pg: WebGLProgram, keep: Set<Region>) => {
                _release(keep)
                for (const r of Array.from(keep)) await _assign(c, pg, r)
        }
        return { sync }
}
const createNode = (mesh: Mesh) => {
        const iMVP = uniform<'mat4'>([...m.mat4.create()], 'iMVP')
        const iOffset = range(SLOT).map((i) => uniform(vec3(0, 0, 0), `iOffset${i}`))
        const iAtlas = range(SLOT).map((i) => uniform('https://r.tsei.jp/texture/world.png', `iAtlas${i}`))
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
        const scl = instance<'vec3'>(mesh.scl, 'scl')
        const pos = instance<'vec3'>(mesh.pos, 'pos')
        const aid = instance<'float'>(mesh.aid, 'aid')
        const fs = Fn(([local, p, n, i]: [Vec3, Vec3, Vec3, Float]) => {
                const L = vec3(LIGHT).normalize()
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
        return { id, x, y, z, pos, scl, load, count: () => count, vox: () => vox }
}
const createRegion = (mesh: Mesh, cam: Camera, i = RX0, j = RY0, slot = -1) => {
        let img: HTMLImageElement
        let ctx: CanvasRenderingContext2D | null = null
        const chunks = new Map<number, Chunk>()
        const [x, y, z] = offOf(i, j)
        solid((ci, cj, ck) => {
                const c = createChunk(ci, cj, ck)
                chunks.set(c.id, c)
        })
        const image = async () => {
                if (img) return img
                img = new Image()
                img.crossOrigin = 'anonymous'
                const promise = new Promise<HTMLImageElement>((resolve) => {
                        img.onload = () => resolve(img)
                })
                img.src = urlOfFrame(i, j)
                return await promise
        }
        const chunk = (_ctx: CanvasRenderingContext2D, i = 0) => {
                ctx = _ctx
                chunks.forEach((c) => {
                        if (!cullChunk(cam.MVP, x, y, z, c.x, c.y, c.z)) return
                        c.load(ctx)
                        mesh.merge(c, i)
                })
        }
        const get = (ci = 0, cj = 0, ck = 0) => chunks.get(chunkId(ci, cj, ck))
        return { x, y, z, slot, image, chunk, get, ctx: () => ctx }
}
const createRegions = (mesh: Mesh, cam: Camera) => {
        const regions = new Map<number, Region>()
        const _ensure = (rx = RX0, ry = RY0) => {
                const id = regionId(rx, ry)
                const got = regions.get(id)
                if (got) return got
                const r = createRegion(mesh, cam, rx, ry, -1)
                regions.set(id, r)
                return r
        }
        const _coord = () => {
                const start = camOf(cam.pos)
                const list = [{ ...start, d: -1 }]
                const _tick = (i = 0, j = 0) => {
                        if (i === 0 && j === 0) return
                        i -= SLOT
                        j -= SLOT
                        const d = Math.hypot(i, j)
                        i += start.i
                        j += start.j
                        const [x, y, z] = offOf(i, j)
                        if (!cullRegion(cam.MVP, x, y, z)) return
                        list.push({ i, j, d })
                }
                for (let i = 0; i < SLOT * 2; i++) for (let j = 0; j < SLOT * 2; j++) _tick(i, j)
                list.sort((a, b) => a.d - b.d)
                return list.filter((e) => clampRegion(e.i, e.j)).slice(0, SLOT)
        }
        const vis = () => {
                const keep = new Set(_coord().map((c) => _ensure(c.i, c.j)))
                for (const [id, r] of regions) if (!keep.has(r)) regions.delete(id)
                return keep
        }
        const pick = (wx = 0, wy = 0, wz = 0) => {
                const rxi = RX0 + Math.floor(wx / REGION)
                const ryj = RY1 - Math.floor(wz / REGION)
                if (rxi < RX0 || rxi > RX1) return 0
                if (ryj < RY0 || ryj > RY1) return 0
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
const createViewer = () => {
        let isLoading = false
        let ts = performance.now()
        let pt = ts
        let dt = 0
        let pt2 = ts - 200
        const cam = createCamera()
        const mesh = createMesh()
        const node = createNode(mesh)
        const slots = createSlots()
        const regions = createRegions(mesh, cam)
        const resize = (gl: GL) => {
                cam.update(gl.size[0] / gl.size[1])
                node.iMVP.value = [...cam.MVP]
        }
        const render = async (gl: GL) => {
                pt = ts
                ts = performance.now()
                if (isLoading) return
                dt = Math.min((ts - pt) / 1000, 0.03) // 0.03 is 1 / (30fps)
                cam.tick(dt, regions.pick)
                cam.update(gl.size[0] / gl.size[1])
                node.iMVP.value = [...cam.MVP]
                if (ts - pt2 < 16) return
                pt2 = ts
                isLoading = true
                mesh.reset()
                const c = gl.webgl.context as WebGL2RenderingContext
                const pg = gl.webgl.program as WebGLProgram
                await slots.sync(c, pg, regions.vis())
                gl.instanceCount = mesh.draw(c, pg)
                isLoading = false
        }
        return { node, cam, render, resize, pt: 0 }
}
/**
 * App
 */
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
                                if (e.key === 'w') viewer.cam.asdw(1, isPress ? 1 : 0)
                                if (e.key === 's') viewer.cam.asdw(1, isPress ? -1 : 0)
                                if (e.key === 'a') viewer.cam.asdw(2, isPress ? -1 : 0)
                                if (e.key === 'd') viewer.cam.asdw(2, isPress ? 1 : 0)
                                if (e.key === 'ArrowUp') viewer.cam.asdw(1, isPress ? 1 : 0)
                                if (e.key === 'ArrowDown') viewer.cam.asdw(1, isPress ? -1 : 0)
                                if (e.key === 'ArrowLeft') viewer.cam.asdw(2, isPress ? -1 : 0)
                                if (e.key === 'ArrowRight') viewer.cam.asdw(2, isPress ? 1 : 0)
                                // Vertical movement in creative mode
                                if (e.code === 'Space') viewer.cam.asdw(0, isPress ? 1 : 0)
                                if (isPress && e.code === 'Space') viewer.cam.jump(JUMP_SPEED)
                                if (e.key === 'Shift') viewer.cam.asdw(0, isPress ? -1 : 0)
                                if (e.key === 'Control') viewer.cam.speed(isPress ? DASH_SPEED : 1)
                                if (e.key === 'Meta') viewer.cam.speed(isPress ? DASH_SPEED : 1)
                                if (e.key === 'Tab' && isPress) {
                                        e.preventDefault()
                                        viewer.cam.tab()
                                }
                        }
                        const onMove = (e: MouseEvent) => {
                                viewer.cam.turn([-e.movementX * TURN_SPEED, -e.movementY * TURN_SPEED])
                        }
                        const onLock = () => {
                                viewer.pt = performance.now()
                                viewer.cam.esc()
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
type Region = ReturnType<typeof createRegion>
type Viewer = ReturnType<typeof createViewer>
