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
const SLOT = 8 // 16
const SPEED = 10
const MOVE = 6
const TURN = 0.0025
const PMAX = Math.PI / 2 - 0.01
const GRAV = 0 // -18
const GROUND = 10
const JUMP = 9
const CHUNK = 16
const REGION = 256
const CAMERA_X = (Math.random() * 0.5 + 0.5) * ROW * REGION // 256
const CAMERA_Y = 1000
const CAMERA_Z = (REGION * (RY1 - RY0 + 1)) / 2
const TARGET_X = -100
const TARGET_Y = 10
const LIGHT = [-0.33, 0.77, 0.55] // normalized afternoon sun
const urlOfFrame = (rx = 0, ry = 0) => `https://pub-a3916cfad25545dc917e91549e7296bc.r2.dev/v1/${rx}_${ry}.png` //  `http://localhost:5173/logs/${rx}_${ry}.png`
const offOf = (i = RX0, j = RY0) => [REGION * (i - RX0), 0, REGION * (RY1 - j)]
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
const createCamera = () => {
        let x = 0
        let mode = false
        let yaw = 0
        let pitch = 0
        let last = 0
        const move = m.vec3.fromValues(CAMERA_X, CAMERA_Y, CAMERA_Z)
        const dir = m.vec3.fromValues(CAMERA_X + TARGET_X, TARGET_Y, CAMERA_Z)
        const up = m.vec3.fromValues(0, 1, 0)
        const vel = m.vec3.create()
        const face = m.vec3.fromValues(-1, 0, 0)
        const right = m.vec3.create()
        const size = m.vec3.fromValues(0.8, 1.8, 0.8)
        const P = m.mat4.create()
        const V = m.mat4.create()
        const MVP = m.mat4.create()
        const _rot = m.mat4.create()
        const _fwd = m.vec3.fromValues(0, 0, -1)
        const faceDir = (out = m.vec3.create(), yaw = 0, pitch = 0) => {
                m.mat4.identity(_rot)
                m.mat4.rotateY(_rot, _rot, yaw)
                if (pitch) m.mat4.rotateX(_rot, _rot, pitch)
                m.vec3.transformMat4(out, _fwd, _rot)
                return out
        }
        const moveDir = (out = m.vec3.create(), f = 0, s = 0, mag = 1) => {
                m.vec3.cross(right, face, up)
                m.vec3.normalize(right, right)
                m.vec3.scale(out, face, f)
                m.vec3.scaleAndAdd(out, out, right, s)
                m.vec3.normalize(out, out)
                m.vec3.scale(out, out, mag)
                return out
        }
        const clampToFace = (p = 0, half = 0.5, sign = 0) => {
                const base = Math.floor(p)
                return sign > 0 ? Math.min(p, base + 1 - half) : Math.max(p, base + half)
        }
        let grounded = false
        const collideAxis = (solidAt: (x: number, y: number, z: number) => number, axis = 0) => {
                const v = vel[axis]
                const s = Math.sign(v)
                if (!s) return
                const xw = move[0] + (axis === 0 ? s : 0)
                const yw = move[1] + (axis === 1 ? s : 0)
                const zw = move[2] + (axis === 2 ? s : 0)
                if (!solidAt(Math.floor(xw), Math.floor(yw), Math.floor(zw))) return
                move[axis] = clampToFace(move[axis], size[axis] * 0.5, s)
                vel[axis] = 0
                if (axis === 1 && s < 0) grounded = true
        }
        const perspective = (aspect = 1) => {
                m.mat4.perspective(P, (28 * Math.PI) / 180, aspect, 0.1, 4000)
                m.mat4.lookAt(V, move, dir, up)
                m.mat4.multiply(MVP, P, V)
        }
        const turn = (delta: number[], time = performance.now()) => {
                yaw -= delta[0] * TURN
                pitch += delta[1] * TURN
                if (pitch > PMAX) pitch = PMAX
                if (pitch < -PMAX) pitch = -PMAX
                faceDir(face, yaw, pitch)
                m.vec3.add(dir, move, face)
                if (time - last < 100) return
                last = time
        }
        const keydir = { f: 0, s: 0 }
        const key = (k = '', on = false) => {
                if (k === 'w') keydir.f = on ? 1 : keydir.f === 1 ? 0 : keydir.f
                if (k === 's') keydir.f = on ? -1 : keydir.f === -1 ? 0 : keydir.f
                if (k === 'a') keydir.s = on ? -1 : keydir.s === -1 ? 0 : keydir.s
                if (k === 'd') keydir.s = on ? 1 : keydir.s === 1 ? 0 : keydir.s
                if (k === ' ') if (on && grounded) vel[1] = JUMP
        }
        const tick = (dt = 0, solidAt: (x: number, y: number, z: number) => number) => {
                if (!mode) {
                        x -= dt * SPEED
                        move[0] = dir[0] = CAMERA_X + x
                        if (move[0] < 0) move[0] = ROW * REGION
                        dir[0] += TARGET_X
                        return
                }
                faceDir(face, yaw, pitch)
                moveDir(move, keydir.f, keydir.s, MOVE)
                vel[1] += GRAV * dt
                grounded = false
                collideAxis(solidAt, 1)
                collideAxis(solidAt, 0)
                collideAxis(solidAt, 2)
                move[0] += vel[0] * dt
                move[1] += vel[1] * dt
                move[2] += vel[2] * dt
                m.vec3.add(dir, move, face)
        }
        return { tick, perspective, move, MVP, turn, key, set: (next = false) => (mode = next) }
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
        return { reset, merge, draw, pos, scl, aid, count: () => count, buf }
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
        return { assign, release, getCtx: () => ctx, set, region: () => region }
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
                if (owner[index]) r.chunk(owner[index].getCtx(), index)
        }
        const _release = (keep: Set<Region>) => {
                owner.forEach((slot) => {
                        if (!slot || keep.has(slot.region())) return
                        slot.release()
                })
        }
        const sync = async (c: WebGL2RenderingContext, pg: WebGLProgram, keep: Set<Region>) => {
                await Promise.all(Array.from(keep).map((r) => _assign(c, pg, r)))
                _release(keep)
        }
        return { sync }
}
const createNode = (mesh: Mesh) => {
        const iMVP = uniform<'mat4'>([...m.mat4.create()], 'iMVP')
        const iOffset = range(SLOT).map((i) => uniform(vec3(0, 0, 0), `iOffset${i}`))
        const iAtlas = range(SLOT).map((i) => uniform('https://r.tsei.jp/texture/world.png', `iAtlas${i}`))
        const atlasUV = Fn(([local, p, n]: [Vec3, Vec3, Vec3]) => {
                const half = float(0.5)
                const wp = p.add(local).sub(n.sign().mul(half)).floor().toVar('wp') // world position
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
        const fs = Fn(([local, p, n, id]: [Vec3, Vec3, Vec3, Float]) => {
                const L = vec3(LIGHT).normalize()
                const diffuse = n.normalize().dot(L).mul(0.5).add(0.5)
                const uv = atlasUV(local, p, n).toVar('uv')
                const texel = pick(id, uv).toVar('t')
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
        return { id, x, y, z, pos, scl, count: () => count, load, vox: () => vox }
}
const createRegion = (mesh: Mesh, cam: Camera, i = RX0, j = RY0, slot = -1) => {
        let img: HTMLImageElement
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
        const chunk = (ctx: CanvasRenderingContext2D, i = 0) => {
                chunks.forEach((c) => {
                        if (!cullChunk(cam.MVP, x, y, z, c.x, c.y, c.z)) return
                        c.load(ctx)
                        mesh.merge(c, i)
                })
        }
        const sample = (lx = 0, ly = 0, lz = 0) => {
                if (lx < 0 || ly < 0 || lz < 0) return 0
                if (lx >= REGION || ly >= REGION || lz >= REGION) return 0
                const ci = Math.floor(lx / CHUNK)
                const cj = Math.floor(ly / CHUNK)
                const ck = Math.floor(lz / CHUNK)
                const c = chunks.get(chunkId(ci, cj, ck))
                if (!c || !c.vox) return 0
                const vx = lx & 15
                const vy = ly & 15
                const vz = lz & 15
                const idx = vx + (vy + vz * CHUNK) * CHUNK
                return c.vox()[idx]
        }
        return { x, y, z, slot, image, chunk, sample }
}
const createRegions = (mesh: Mesh, cam: Camera) => {
        const regions = new Map<number, Region>()
        const _clamp = (x = 0, a = 0, b = 1) => (x < a ? a : x > b ? b : x)
        const _ensure = (rx = RX0, ry = RY0) => {
                const id = regionId(rx, ry)
                const got = regions.get(id)
                if (got) return got
                const r = createRegion(mesh, cam, rx, ry, -1)
                regions.set(id, r)
                return r
        }
        const _coord = () => {
                const cx = cam.move[0]
                const cz = cam.move[2]
                const start = [_clamp(RX0 + Math.floor(cx / REGION), RX0, RX1), _clamp(RY1 - Math.floor(cz / REGION), RY0, RY1)] as [number, number]
                const q = [start] as [number, number][]
                const seen = new Set<string>([start.join(',')])
                const list = [] as { i: number; j: number; d: number }[]
                const add = (i: number, j: number) => {
                        const [x, y, z] = offOf(i, j)
                        if (!cullRegion(cam.MVP, x, y, z)) return
                        const dx = x + 128 - cx
                        const dz = z + 128 - cz
                        list.push({ i, j, d: Math.hypot(dx, dz) })
                }
                for (let i = 0; i < q.length && list.length < SLOT * 2; i++) {
                        const [rx, ry] = q[i]
                        add(rx, ry)
                        // prettier-ignore
                        for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]] as const) {
                                const nx = rx + dx
                                const ny = ry + dy
                                if (nx < RX0 || nx > RX1 || ny < RY0 || ny > RY1) continue
                                const key = nx + ',' + ny
                                if (seen.has(key)) continue
                                seen.add(key)
                                q.push([nx, ny])
                        }
                }
                list.sort((a, b) => a.d - b.d)
                return list.slice(0, SLOT).map((e) => [e.i, e.j] as [number, number])
        }
        const vis = () => {
                const keep = new Set(_coord().map(([x, y]) => _ensure(x, y)))
                for (const [id, r] of regions) if (!keep.has(r)) regions.delete(id)
                return keep
        }
        const get = (rx = RX0, ry = RY0) => regions.get(regionId(rx, ry))
        return { vis, get }
}
const createViewer = () => {
        let isLoading = false
        let ts = performance.now()
        let pt = ts
        let dt = 0
        let pt2 = pt
        const cam = createCamera()
        const mesh = createMesh()
        const node = createNode(mesh)
        const slots = createSlots()
        const regions = createRegions(mesh, cam)
        const solidAt = (x = 0, y = 0, z = 0) => {
                if (x < 0 || z < 0) return 0
                const rx = RX0 + Math.floor(x / REGION)
                const ry = RY1 - Math.floor(z / REGION)
                if (rx < RX0 || rx > RX1) return 0
                if (ry < RY0 || ry > RY1) return 0
                const r = regions.get(rx, ry)
                if (!r) return 0
                const lx = x - r.x
                const ly = y - r.y
                const lz = z - r.z
                return r.sample(lx, ly, lz)
        }
        const resize = (gl: GL) => {
                cam.perspective(gl.size[0] / gl.size[1])
                node.iMVP.value = [...cam.MVP]
        }
        const render = async (gl: GL) => {
                pt = ts
                ts = performance.now()
                dt = (ts - pt) / 1000
                cam.tick(dt, solidAt)
                cam.perspective(gl.size[0] / gl.size[1])
                node.iMVP.value = [...cam.MVP]
                if (ts - pt2 < 100) return
                pt2 = ts
                if (isLoading) return
                isLoading = true
                mesh.reset()
                const c = gl.webgl.context as WebGL2RenderingContext
                const pg = gl.webgl.program as WebGLProgram
                await slots.sync(c, pg, regions.vis())
                gl.instanceCount = mesh.draw(c, pg)
                isLoading = false
        }
        return { vert: node.vert, frag: node.frag, cam, render, resize, turn: (dx = 0, dy = 0) => cam.turn([dx, dy]), key: (k = '', on = false) => cam.key(k, on) }
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
                vert: viewer.vert,
                frag: viewer.frag,
                render() {
                        viewer.render(gl)
                },
                resize() {
                        viewer.resize(gl)
                },
                mount() {
                        const press = (on: boolean, e: KeyboardEvent) => {
                                if (document.pointerLockElement !== gl.el) return
                                if (e.key === 'w') viewer.key('w', on)
                                if (e.key === 's') viewer.key('s', on)
                                if (e.key === 'a') viewer.key('a', on)
                                if (e.key === 'd') viewer.key('d', on)
                                if (e.key === ' ') viewer.key(' ', on)
                        }
                        const move = (e: MouseEvent) => {
                                if (document.pointerLockElement !== gl.el) return
                                viewer.turn(e.movementX, e.movementY)
                        }
                        const lock = () => {
                                if (document.pointerLockElement === gl.el) viewer.cam.set(true)
                                else viewer.cam.set(false)
                        }
                        const click = () => {
                                gl.el?.requestPointerLock()
                        }
                        gl.el.addEventListener('click', click)
                        window.addEventListener('pointerlockchange', lock)
                        window.addEventListener('mousemove', move)
                        window.addEventListener('keydown', press.bind(null, true))
                        window.addEventListener('keyup', press.bind(null, false))
                },
        })
        return <canvas ref={gl.ref} style={{ top: 0, left: 0, position: 'absolute', background: '#212121', width: '100%', height: '100%' }} />
}
export default function Home() {
        const [viewer, set] = useState<any>()
        useEffect(() => void set(createViewer()), [])
        return <Layout noFooter>{viewer ? <Canvas viewer={viewer} /> : null}</Layout>
}
type Camera = ReturnType<typeof createCamera>
type Chunk = ReturnType<typeof createChunk>
type Mesh = ReturnType<typeof createMesh>
type Region = ReturnType<typeof createRegion>
type Viewer = ReturnType<typeof createViewer>
