import Layout from '@theme/Layout'
import * as m from 'gl-matrix'
import { useEffect, useState } from 'react'
import { GL, useGL } from 'glre/src/react'
import { attribute, uniform, vec4, vec3, Fn, vertexStage, instance, float, Vec3, vec2, texture, clamp, If } from 'glre/src/node'
type Mesh = { vertex: number[]; normal: number[]; pos: number[]; scl: number[]; aid: number[]; count: number; cnt: number; _buf: any }
type Chunk = { i: number; j: number; k: number; x: number; y: number; z: number; vox: Uint8Array; pos: number[]; scl: number[]; cnt: number; visible: boolean; dirty: boolean; gen: boolean }
type Region = { rx: number; ry: number; x: number; y: number; z: number; slot: number; loaded: boolean; pending: boolean; chunks: Map<number, Chunk>; visible: boolean }
type Camera = { position: m.vec3; target: m.vec3; up: m.vec3; fov: number; near: number; far: number }
const VERTEX = [-0.5, -0.5, -0.5, -0.5, -0.5, 0.5, -0.5, 0.5, 0.5, -0.5, 0.5, 0.5, -0.5, 0.5, -0.5, -0.5, -0.5, -0.5, 0.5, -0.5, 0.5, 0.5, -0.5, -0.5, 0.5, 0.5, -0.5, 0.5, 0.5, -0.5, 0.5, 0.5, 0.5, 0.5, -0.5, 0.5, -0.5, -0.5, -0.5, 0.5, -0.5, -0.5, 0.5, -0.5, 0.5, 0.5, -0.5, 0.5, -0.5, -0.5, 0.5, -0.5, -0.5, -0.5, -0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, -0.5, 0.5, 0.5, -0.5, -0.5, 0.5, -0.5, -0.5, 0.5, 0.5, 0.5, -0.5, -0.5, -0.5, -0.5, -0.5, -0.5, 0.5, -0.5, -0.5, 0.5, -0.5, 0.5, 0.5, -0.5, 0.5, -0.5, -0.5, -0.5, -0.5, 0.5, 0.5, -0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, -0.5, 0.5, 0.5, -0.5, -0.5, 0.5]
const NORMAL = [-1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1]
const FPS = 30
const RX0 = 28
const RX1 = 123
const RY0 = 75
const RY1 = 79
const SLOT = 16
const ROW = RX1 - RX0 + 1 // 96 region = 96×16×16 voxel
const SIZE = 16
const REGION = 256
const PLANE = 4
const MOVIE = '/tokyo23-atlas-96x5.mp4'
const X = Math.random() * ROW * REGION // 256
const Y = 50
const Z = 256 * 2.5
const range = (n = 0) => [...Array(n).keys()]
const frameOf = (rx = 0, ry = 0) => (ry - RY0) * ROW + (rx - RX0)
const timeOf = (f = 0) => f / FPS
const offOf = (rx = RX0, ry = RY0) => [REGION * (rx - RX0), 0, REGION * (RY1 - ry)]
const chunkId = (i = 0, j = 0, k = 0) => i + j * SIZE + k * SIZE * SIZE
const regionId = (i = 0, j = 0) => i + 160 * j // DO NOT CHANGE
const cullChunk = (VP: m.mat4, region: Region, c: Chunk) => visSphere(VP, region.x + c.x + 8, region.y + c.y + 8, region.z + c.z + 8, Math.sqrt(16 * 16 * 3) * 0.5)
const cullRegion = (VP: m.mat4, region: Region) => visSphere(VP, region.x + 128, region.y + 128, region.z + 128, Math.sqrt(256 * 256 * 3) * 0.5)
const eachChunk = (f: (i: number, j: number, k: number) => void) => {
        for (let k = 0; k < SIZE; k++) for (let j = 0; j < SIZE; j++) for (let i = 0; i < SIZE; i++) f(i, j, k)
}
const seek = (video: HTMLVideoElement, t = 0) =>
        new Promise<void>((resolve) => {
                video.addEventListener('seeked', () => resolve(), { once: true })
                video.currentTime = t
        })
const visSphere = (M: m.mat4, cx = 0, cy = 0, cz = 0, r = 1) => {
        const t = (ax: number, ay: number, az: number, aw: number) => (ax * cx + ay * cy + az * cz + aw) / (Math.hypot(ax, ay, az) || 1) + r < 0
        if (t(M[3] + M[0], M[7] + M[4], M[11] + M[8], M[15] + M[12])) return false
        if (t(M[3] - M[0], M[7] - M[4], M[11] - M[8], M[15] - M[12])) return false
        if (t(M[3] + M[1], M[7] + M[5], M[11] + M[9], M[15] + M[13])) return false
        if (t(M[3] - M[1], M[7] - M[5], M[11] - M[9], M[15] - M[13])) return false
        if (t(M[3] + M[2], M[7] + M[6], M[11] + M[10], M[15] + M[14])) return false
        if (t(M[3] - M[2], M[7] - M[6], M[11] - M[10], M[15] - M[14])) return false
        return true
}
const greedyMesh = (src: Uint8Array, size = 1, pos: number[] = [], scl: number[] = [], cnt = 0) => {
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
const createShader = (camera: Camera, mesh: Mesh) => {
        const proj = (out = m.mat4.create()) => {
                m.mat4.perspective(out, (camera.fov * Math.PI) / 180, 1280 / 800, camera.near, camera.far)
                return out
        }
        const view = (out = m.mat4.create()) => {
                m.mat4.lookAt(out, camera.position, camera.target, camera.up)
                return out
        }
        const MVP = (M = m.mat4.create(), VP = m.mat4.multiply(m.mat4.create(), proj(), view())) => {
                m.mat4.multiply(M, VP, M)
                return [...M]
        }
        const iMVP = uniform<'mat4'>(MVP(), 'iMVP')
        const iAtlas = range(SLOT).map((i) => uniform('/world.png', `iAtlas${i}`))
        const iAtlasSize = uniform(vec2(4096, 4096), 'iAtlasSize')
        const iPlaneSize = uniform(vec2(1024, 1024), 'iPlaneSize')
        const iPlaneCols = uniform(float(PLANE), 'iPlaneCols')
        const iOff = range(SLOT).map((i) => uniform(vec3(0, 0, 0), `iOff${i}`))
        const atlasUV = Fn(([n, local, iPos, id]: [Vec3, Vec3, Vec3, any]) => {
                const half = float(0.5)
                const off = vec3(0, 0, 0).toVar('off')
                range(SLOT).forEach((i) => {
                        If(id.equal(i), () => {
                                off.assign(iOff[i])
                        })
                })
                const W = iPos.sub(off).add(local).sub(n.sign().mul(half)).floor().toVar('W')
                const ci = W.x.div(16).floor()
                const ck = W.y.div(16).floor()
                const cj = W.z.div(16).floor()
                const lx = W.x.mod(16)
                const ly = W.y.mod(16)
                const lz = W.z.mod(16)
                const px = cj.mod(iPlaneCols)
                const py = cj.div(iPlaneCols).floor()
                const zt = vec2(px.mul(iPlaneSize.x), py.mul(iPlaneSize.y))
                const ct = vec2(ci.mul(64), ck.mul(64))
                const lt = vec2(lz.mod(4).mul(16).add(lx), lz.div(4).floor().mul(16).add(ly))
                const uv = zt.add(ct).add(lt).add(vec2(0.5)).div(iAtlasSize)
                const eps = float(0.5).div(iAtlasSize.x.max(iAtlasSize.y))
                return clamp(uv, vec2(eps), vec2(float(1).sub(eps)))
        })
        const vertex = attribute<'vec3'>(mesh.vertex, 'vertex')
        const normal = attribute<'vec3'>(mesh.normal, 'normal')
        const scl = instance<'vec3'>(mesh.scl, 'scl')
        const pos = instance<'vec3'>(mesh.pos, 'pos')
        const aid = instance<'float'>(mesh.aid, 'aid')
        const pick = Fn(([id, uv]: [any, any]) => {
                const t = vec4(0, 0, 0, 1).toVar('t')
                range(SLOT).map((i) => {
                        If(id.equal(i), () => {
                                t.assign(texture(iAtlas[i], uv))
                        })
                })
                return t
        })
        const fs = Fn(([n, local, iPos, id]: [Vec3, Vec3, Vec3, any]) => {
                const L = vec3(0.3, 0.7, 0.5).normalize()
                const diffuse = n.normalize().dot(L).max(0.25)
                const uv = atlasUV(n, local, iPos, id).toVar('uv')
                const texel = pick(id, uv).toVar('t')
                const rgb = texel.rgb.mul(diffuse).max(diffuse.div(3)).toVar('rgb')
                return vec4(rgb, 1)
        })
        const vs = Fn(([p, iPos, iScl]: [Vec3, Vec3, Vec3]) => iMVP.mul(vec4(p.mul(iScl).add(iPos), 1)))
        const vert = vs(vertex, pos, scl)
        const frag = fs(vertexStage(normal), vertexStage(vertex.mul(scl)), vertexStage(pos), vertexStage(aid))
        const updateCamera = (size: number[]) => {
                const P = m.mat4.create()
                const V = m.mat4.create()
                m.mat4.perspective(P, (camera.fov * Math.PI) / 180, size[0] / size[1], camera.near, camera.far)
                m.mat4.lookAt(V, camera.position, camera.target, camera.up)
                const VP = m.mat4.multiply(m.mat4.create(), P, V)
                const M = m.mat4.create()
                m.mat4.multiply(M, VP, M)
                iMVP.value = M
        }
        const setOffset = (slot = 0, off: number[] = [0, 0, 0]) => {
                range(SLOT).map((i) => {
                        if (slot === i) iOff[i].value = off
                })
        }
        const setTex = (slot = 0, src: any) => {
                if (!src) return
                range(SLOT).map((i) => {
                        if (slot === i) iAtlas[i].value = src
                })
        }
        return { vert, frag, updateCamera, setOffset, setTex }
}
const createRegion = (rx = RX0, ry = RY0, slot = -1): Region => {
        const chunks = new Map<number, Chunk>()
        eachChunk((i, j, k) => {
                const id = chunkId(i, j, k)
                const x = i * 16
                const y = j * 16
                const z = k * 16
                chunks.set(id, { i, j, k, x, y, z, vox: new Uint8Array(16 * 16 * 16), pos: [], scl: [], cnt: 0, visible: false, dirty: false, gen: false })
        })
        const [x, y, z] = offOf(rx, ry)
        return { rx, ry, x, y, z, slot, loaded: false, pending: false, chunks, visible: false }
}
const split64ToVox01 = (png64: Uint8ClampedArray) => {
        const dst = new Uint8Array(SIZE * SIZE * SIZE)
        const get = (x = 0, y = 0) => ((y * 64 + x) * 4) | 0
        let p = 0
        const T = 8
        eachChunk((x, y, z) => {
                const ox = (z & 3) * 16
                const oy = (z >> 2) * 16
                const si = get(ox + x, oy + y)
                const r = png64[si]
                const g = png64[si + 1]
                const b = png64[si + 2]
                const s = r + g + b
                dst[p++] = s > T ? 1 : 0
        })
        return dst
}
const extractTile64 = (ctx: CanvasRenderingContext2D, ci = 0, cj = 0, ck = 0) => {
        const planeX = ck & 3
        const planeY = ck >> 2
        const ox = planeX * 1024 + ci * 64
        const oy = planeY * 1024 + cj * 64
        return ctx.getImageData(ox, oy, 64, 64).data
}
const meshChunk = (ctx: CanvasRenderingContext2D, region: Region, c: Chunk) => {
        if (c.gen) return
        const tile = extractTile64(ctx, c.i, c.j, c.k)
        const vox = split64ToVox01(tile)
        const m = greedyMesh(vox, SIZE)
        for (let i = 0; i < m.cnt; i++) {
                const j = i * 3
                m.pos[j] += region.x + c.x
                m.pos[j + 1] += region.y + c.y
                m.pos[j + 2] += region.z + c.z
        }
        c.pos = m.pos
        c.scl = m.scl
        c.cnt = m.cnt
        c.gen = true
        c.visible = !!m.cnt
}
const createViewer = () => {
        const cam = { position: m.vec3.fromValues(X, Y, Z), target: m.vec3.fromValues(X + 100, Y, Z), up: m.vec3.fromValues(0, 1, 0), fov: 60, near: 0.1, far: 4000 }
        const mesh = { vertex: VERTEX, normal: NORMAL, pos: [0, 0, 0], scl: [0, 0, 0], aid: [0], count: 36, cnt: 1, _buf: {} }
        const shader = createShader(cam, mesh)
        let t0 = performance.now()
        let dist = 0
        const video = document.createElement('video') as HTMLVideoElement
        let meta = false
        video.crossOrigin = 'anonymous'
        video.muted = true
        video.preload = 'auto'
        video.playsInline = true
        video.src = MOVIE
        video.addEventListener('loadedmetadata', () => (meta = true), { once: true })
        video.load()
        const slotCanvas = range(SLOT).map(() => {
                const cv = document.createElement('canvas')
                cv.width = 4096
                cv.height = 4096
                return cv
        }) as HTMLCanvasElement[]
        const slotCtx = slotCanvas.map((cv) => cv.getContext('2d', { willReadFrequently: true }) as CanvasRenderingContext2D)
        const slotUsed = range(SLOT).map(() => false) as boolean[]
        const slotOwner = range(SLOT) as unknown as (Region | null)[]
        const regions = new Map<number, Region>()
        const ensureRegion = (rx = RX0, ry = RY0) => {
                const id = regionId(rx, ry)
                const got = regions.get(id)
                if (got) return got
                const r = createRegion(rx, ry, -1)
                regions.set(id, r)
                return r
        }
        const assignSlot = (r: Region) => {
                if (r.slot >= 0) return r.slot
                for (let i = 0; i < SLOT; i++) {
                        if (slotUsed[i]) continue
                        slotUsed[i] = true
                        slotOwner[i] = r
                        r.slot = i
                        shader.setOffset(i, [r.x, r.y, r.z])
                        return i
                }
                return -1
        }
        const releaseSlots = (keep: Set<Region>) => {
                for (let i = 0; i < SLOT; i++) {
                        const r = slotOwner[i]
                        if (!r) continue
                        if (keep.has(r)) continue
                        slotUsed[i] = false
                        slotOwner[i] = null
                        r.slot = -1
                        r.loaded = false
                        r.pending = false
                }
        }
        const VP = (gl: GL, P = m.mat4.create(), V = m.mat4.create(), out = m.mat4.create()) => {
                m.mat4.perspective(P, (cam.fov * Math.PI) / 180, gl.size[0] / gl.size[1], cam.near, cam.far)
                m.mat4.lookAt(V, cam.position, cam.target, cam.up)
                m.mat4.multiply(out, P, V)
                return out
        }
        const windowCoords = (VPmat: m.mat4) => {
                const cx = cam.position[0]
                const cz = cam.position[2]
                const clampi = (x: number, a: number, b: number) => (x < a ? a : x > b ? b : x)
                const start: [number, number] = [clampi(RX0 + Math.floor(cx / REGION), RX0, RX1), clampi(RY1 - Math.floor(cz / REGION), RY0, RY1)]
                const q: [number, number][] = [start]
                const seen = new Set<string>([start.join(',')])
                const list: { rx: number; ry: number; d: number }[] = []
                const need = SLOT * 2
                const add = (rx: number, ry: number) => {
                        const [x, y, z] = offOf(rx, ry)
                        if (!cullRegion(VPmat, { x, y, z } as any)) return
                        const dx = x + 128 - cx
                        const dz = z + 128 - cz
                        list.push({ rx, ry, d: Math.hypot(dx, dz) })
                }
                for (let i = 0; i < q.length && list.length < need; i++) {
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
                return list.slice(0, SLOT).map((e) => [e.rx, e.ry] as [number, number])
        }
        const visRegions = (gl: GL) => {
                const vp = VP(gl)
                const keep = new Set(windowCoords(vp).map(([x, y]) => ensureRegion(x, y)))
                for (const [id, r] of regions) if (!keep.has(r)) regions.delete(id)
                return { vis: keep, keep, VP: vp }
        }
        const applyInstances = (gl: GL) => {
                const c = gl.webgl.context as WebGL2RenderingContext
                const pg = gl.webgl.program as WebGLProgram
                const bufs = mesh._buf as any
                const bindAttrib = (key: string, data: number[], size: number) => {
                        const loc = c.getAttribLocation(pg, key)
                        if (loc < 0) return
                        const array = new Float32Array(data)
                        const buf = (bufs[key] = bufs[key] || c.createBuffer())
                        c.bindBuffer(c.ARRAY_BUFFER, buf)
                        if (!bufs[key + ':init']) {
                                c.bufferData(c.ARRAY_BUFFER, array, c.DYNAMIC_DRAW)
                                c.enableVertexAttribArray(loc)
                                c.vertexAttribPointer(loc, size, c.FLOAT, false, 0, 0)
                                c.vertexAttribDivisor(loc, 1)
                                bufs[key + ':init'] = 1
                                bufs[key + ':len'] = array.length
                                return
                        }
                        if (bufs[key + ':len'] !== array.length) {
                                c.bufferData(c.ARRAY_BUFFER, array, c.DYNAMIC_DRAW)
                                bufs[key + ':len'] = array.length
                                return
                        }
                        c.bufferSubData(c.ARRAY_BUFFER, 0, array)
                }
                gl.instanceCount = mesh.cnt
                bindAttrib('scl', mesh.scl, 3)
                bindAttrib('pos', mesh.pos, 3)
                bindAttrib('aid', mesh.aid, 1)
        }
        const tex = range(SLOT).fill(null as any) as any
        const uploadSlotGL = (gl: GL, slot = 0) => {
                const c = gl.webgl.context as WebGL2RenderingContext
                const pg = gl.webgl.program as WebGLProgram
                const loc = c.getUniformLocation(pg, `iAtlas${slot}`)
                let t = tex[slot]
                if (!t) t = tex[slot] = c.createTexture()
                c.activeTexture(c.TEXTURE0 + slot)
                c.bindTexture(c.TEXTURE_2D, t)
                c.texParameteri(c.TEXTURE_2D, c.TEXTURE_MIN_FILTER, c.NEAREST)
                c.texParameteri(c.TEXTURE_2D, c.TEXTURE_MAG_FILTER, c.NEAREST)
                c.texParameteri(c.TEXTURE_2D, c.TEXTURE_WRAP_S, c.CLAMP_TO_EDGE)
                c.texParameteri(c.TEXTURE_2D, c.TEXTURE_WRAP_T, c.CLAMP_TO_EDGE)
                c.pixelStorei(c.UNPACK_ALIGNMENT, 1)
                c.pixelStorei(c.UNPACK_FLIP_Y_WEBGL, 0)
                c.texImage2D(c.TEXTURE_2D, 0, c.RGBA, c.RGBA, c.UNSIGNED_BYTE, slotCanvas[slot])
                if (loc) c.uniform1i(loc, slot)
                c.bindTexture(c.TEXTURE_2D, null)
                const owner = slotOwner[slot]
                if (owner) shader.setOffset(slot, [owner.x, owner.y, owner.z])
        }
        const jobs: { r: Region; slot: number; t: number }[] = []
        let busy = false
        const prime = async (gl: any) => {
                if (busy) return
                const job = jobs.shift()
                if (!job) return
                busy = true
                await seek(video, job.t)
                if (slotOwner[job.slot] !== job.r) {
                        busy = false
                        return prime(gl)
                }
                slotCtx[job.slot].drawImage(video, 0, 0, 4096, 4096)
                uploadSlotGL(gl, job.slot)
                shader.setTex(job.slot, slotCanvas[job.slot])
                job.r.loaded = true
                job.r.pending = false
                busy = false
                prime(gl)
        }
        const dir = m.vec3.create()
        const render = (gl: any) => {
                const t1 = performance.now()
                const dt = (t1 - t0) / 1000
                dist += dt * 32
                const x = (X + dist) % (ROW * REGION)
                cam.position[0] = x
                cam.target[0] = x + 128
                cam.position[0] += dir[0]
                cam.position[1] += dir[1]
                cam.position[2] += dir[2]
                cam.target[0] += dir[0]
                // cam.target[1] += dir[1]
                cam.target[2] += dir[2]
                shader.updateCamera(gl.size)
                t0 = t1
                const regions = visRegions(gl)
                regions.keep.forEach((r) => {
                        const s = assignSlot(r)
                        if (s < 0) return
                        if (!meta) return
                        if (r.loaded) return
                        if (r.pending) return
                        r.pending = true
                        jobs.push({ r, slot: s, t: timeOf(frameOf(r.rx, r.ry)) })
                        prime(gl)
                })
                const pos: number[] = []
                const scl: number[] = []
                const aid: number[] = []
                let cnt = 0
                regions.vis.forEach((r) => {
                        const slot = assignSlot(r)
                        if (slot < 0) return
                        if (!r.loaded) return
                        r.chunks.forEach((c) => {
                                if (cullChunk(regions.VP, r, c)) meshChunk(slotCtx[slot], r, c)
                                if (!c.visible) return
                                if (!c.cnt) return
                                pos.push(...c.pos)
                                scl.push(...c.scl)
                                for (let n = 0; n < c.cnt; n++) aid.push(slot)
                                cnt += c.cnt
                        })
                })
                mesh.pos = pos.length ? pos : [0, 0, 0]
                mesh.scl = scl.length ? scl : [0, 0, 0]
                mesh.aid = aid.length ? aid : [0]
                mesh.cnt = Math.max(1, cnt)
                applyInstances(gl)
                releaseSlots(regions.keep)
        }
        const asdw = (axis = 0, delta = 0) => {
                dir[axis] = delta
        }
        const press = (isPress: boolean, e: any) => {
                if (e.key === 'w') asdw(1, isPress ? 1 : 0)
                if (e.key === 's') asdw(1, isPress ? -1 : 0)
                if (e.key === 'a') asdw(2, isPress ? -1 : 0)
                if (e.key === 'd') asdw(2, isPress ? 1 : 0)
        }
        const resize = (gl: any) => shader.updateCamera(gl.size)
        return { vert: shader.vert, frag: shader.frag, count: mesh.count, instanceCount: mesh.cnt, render, resize, press }
}

const Canvas = ({ viewer }: any) => {
        const gl = useGL({
                isWebGL: true,
                isDepth: true,
                isDebug: true,
                count: viewer.count,
                instanceCount: viewer.instanceCount,
                vert: viewer.vert,
                frag: viewer.frag,
                render() {
                        viewer.render(gl)
                },
                resize() {
                        viewer.resize(gl)
                },
                mount() {
                        window.addEventListener('keydown', viewer.press.bind(null, true))
                        window.addEventListener('keyup', viewer.press.bind(null, false))
                },
        })
        return <canvas ref={gl.ref} style={{ top: 0, left: 0, position: 'absolute', background: '#212121', width: '100%', height: '100%' }} />
}

export default function Home() {
        const [viewer, set] = useState<any>()
        useEffect(() => void set(createViewer()), [])
        return viewer ? <Canvas viewer={viewer} /> : null
        return <Layout noFooter>{viewer ? <Canvas viewer={viewer} /> : null}</Layout>
}
