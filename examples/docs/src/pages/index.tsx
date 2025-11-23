// @ts-ignore
import Layout from '@theme/Layout'
import * as m from 'gl-matrix'
import { useEffect, useState } from 'react'
import { GL, useGL } from 'glre/src/react'
import { attribute, uniform, vec4, vec3, Fn, vertexStage, instance, float, Vec3, vec2, texture, clamp, If, Float, Vec2 } from 'glre/src/node'
type Mesh = { vertex: number[]; normal: number[]; pos: number[]; scl: number[]; aid: number[]; count: number; cnt: number; _buf: any }
type Camera = { position: m.vec3; target: m.vec3; up: m.vec3; fov: number; near: number; far: number }
const VERTEX = [-0.5, -0.5, -0.5, -0.5, -0.5, 0.5, -0.5, 0.5, 0.5, -0.5, 0.5, 0.5, -0.5, 0.5, -0.5, -0.5, -0.5, -0.5, 0.5, -0.5, 0.5, 0.5, -0.5, -0.5, 0.5, 0.5, -0.5, 0.5, 0.5, -0.5, 0.5, 0.5, 0.5, 0.5, -0.5, 0.5, -0.5, -0.5, -0.5, 0.5, -0.5, -0.5, 0.5, -0.5, 0.5, 0.5, -0.5, 0.5, -0.5, -0.5, 0.5, -0.5, -0.5, -0.5, -0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, -0.5, 0.5, 0.5, -0.5, -0.5, 0.5, -0.5, -0.5, 0.5, 0.5, 0.5, -0.5, -0.5, -0.5, -0.5, -0.5, -0.5, 0.5, -0.5, -0.5, 0.5, -0.5, 0.5, 0.5, -0.5, 0.5, -0.5, -0.5, -0.5, -0.5, 0.5, 0.5, -0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, -0.5, 0.5, 0.5, -0.5, -0.5, 0.5]
const NORMAL = [-1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1]
const RX0 = 28
const RX1 = 123
const RY0 = 75
const RY1 = 79
const ROW = RX1 - RX0 + 1 // 96 region = 96×16×16 voxel
const SLOT = 16
const SPEED = 50
const CHUNK = 16
const REGION = 256
const CAMERA_X = (Math.random() * 0.5 + 0.5) * ROW * REGION // 256
const CAMERA_Y = 400
const CAMERA_Z = 256 * 2.5
const TARGET_X = -100
const TARGET_Y = 100
const LIGHT = [-0.3, 0.7, 0.5]
const urlOfFrame = (rx: number, ry: number) => `http://localhost:5173/logs/${rx}_${ry}.png`
const offOf = (i = RX0, j = RY0) => [REGION * (i - RX0), 0, REGION * (RY1 - j)]
const range = (n = 0) => [...Array(n).keys()]
const chunkId = (i = 0, j = 0, k = 0) => i + j * CHUNK + k * CHUNK * CHUNK
const regionId = (i = 0, j = 0) => i + 160 * j // DO NOT CHANGE
const cullChunk = (VP: m.mat4, rx = 0, ry = 0, rz = 0, cx = 0, cy = 0, cz = 0) => visSphere(VP, rx + cx + 8, ry + cy + 8, rz + cz + 8, Math.sqrt(16 * 16 * 3) * 0.5)
const cullRegion = (VP: m.mat4, rx = 0, ry = 0, rz = 0) => visSphere(VP, rx + 128, ry + 128, rz + 128, Math.sqrt(256 * 256 * 3) * 0.5)
const each = (f: (i: number, j: number, k: number) => void) => {
        for (let k = 0; k < CHUNK; k++) for (let j = 0; j < CHUNK; j++) for (let i = 0; i < CHUNK; i++) f(i, j, k)
}
const createContext = () => {
        const el = document.createElement('canvas')
        Object.assign(el, { width: 4096, height: 4096 })
        return el.getContext('2d', { willReadFrequently: true })!
}
const _P = m.mat4.create()
const _V = m.mat4.create()
const perspective = (cam: Camera, aspect: number, out = m.mat4.create()) => {
        m.mat4.perspective(_P, (cam.fov * Math.PI) / 180, aspect, cam.near, cam.far)
        m.mat4.lookAt(_V, cam.position, cam.target, cam.up)
        m.mat4.multiply(out, _P, _V)
        return out
}
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
/**
 * shader
 */
const createShader = (mesh: Mesh) => {
        const iMVP = uniform<'mat4'>([...m.mat4.create()], 'iMVP')
        const iOffset = range(SLOT).map((i) => uniform(vec3(0, 0, 0), `iOffset${i}`))
        const iAtlas = range(SLOT).map((i) => uniform('/world.png', `iAtlas${i}`))
        const atlasUV = Fn(([n, local, p, id]: [Vec3, Vec3, Vec3, Float]) => {
                const half = float(0.5)
                const off = vec3(0, 0, 0).toVar('off')
                range(SLOT).forEach((i) => {
                        If(id.equal(i), () => {
                                off.assign(iOffset[i])
                        })
                })
                const W = p.sub(off).add(local).sub(n.sign().mul(half)).floor().toVar('W')
                const ci = W.x.div(16).floor().toVar('ci')
                const cj = W.z.div(16).floor().toVar('cj')
                const ck = W.y.div(16).floor().toVar('ck')
                const lx = W.x.mod(16).toVar('lx')
                const ly = W.y.mod(16).toVar('ly')
                const lz = W.z.mod(16).toVar('lz')
                const zt = vec2(cj.mod(4).mul(1024), cj.div(4).floor().mul(1024)) // 1024 is plane size
                const ct = vec2(ci.mul(64), ck.mul(64))
                const lt = vec2(lz.mod(4).mul(16).add(lx), lz.div(4).floor().mul(16).add(ly))
                const uv = zt.add(ct).add(lt).add(vec2(0.5)).div(4096) // 4096 is atlas size
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
        const vertex = attribute<'vec3'>(mesh.vertex, 'vertex')
        const normal = attribute<'vec3'>(mesh.normal, 'normal')
        const scl = instance<'vec3'>(mesh.scl, 'scl')
        const pos = instance<'vec3'>(mesh.pos, 'pos')
        const aid = instance<'float'>(mesh.aid, 'aid')
        const fs = Fn(([n, local, p, id]: [Vec3, Vec3, Vec3, Float]) => {
                const L = vec3(LIGHT).normalize()
                const diffuse = n.normalize().dot(L).max(0.25)
                const uv = atlasUV(n, local, p, id).toVar('uv')
                const texel = pick(id, uv).toVar('t')
                const rgb = texel.rgb.mul(diffuse).max(diffuse.div(3)).toVar('rgb')
                return vec4(rgb, 1)
        })
        const frag = fs(vertexStage(normal), vertexStage(vertex.mul(scl)), vertexStage(pos), vertexStage(aid))
        const vert = iMVP.mul(vec4(vertex.mul(scl).add(pos), 1))
        return { vert, frag, iMVP, iOffset, iAtlas }
}
const createChunk = (i = 0, j = 0, k = 0) => {
        let isMeshed = false
        let cnt: number
        const pos = [] as number[]
        const scl = [] as number[]
        const id = chunkId(i, j, k)
        const x = i * 16
        const y = j * 16
        const z = k * 16
        const load = (rx = 0, ry = 0, rz = 0, ctx: CanvasRenderingContext2D) => {
                if (isMeshed) return
                const tile = ctx.getImageData((k & 3) * 1024 + i * 64, (k >> 2) * 1024 + j * 64, 64, 64).data
                const vox = new Uint8Array(CHUNK * CHUNK * CHUNK)
                const get = (x = 0, y = 0) => ((y * 64 + x) * 4) | 0
                let p = 0
                each((x, y, z) => {
                        const si = get((z & 3) * CHUNK + x, (z >> 2) * CHUNK + y)
                        const s = tile[si] + tile[si + 1] + tile[si + 2]
                        vox[p++] = s > 8 ? 1 : 0
                })
                cnt = greedyMesh(vox, CHUNK, pos, scl).cnt
                for (let i = 0; i < cnt; i++) {
                        const j = i * 3
                        pos[j] += rx + x
                        pos[j + 1] += ry + y
                        pos[j + 2] += rz + z
                }
                isMeshed = true
        }
        return { id, i, j, k, x, y, z, pos, scl, cnt: () => cnt, load }
}
const createRegion = (i = RX0, j = RY0, slot = -1) => {
        let image: HTMLImageElement
        const chunks = new Map<number, Chunk>()
        const [x, y, z] = offOf(i, j)
        each((ci, cj, ck) => {
                const c = createChunk(ci, cj, ck)
                chunks.set(c.id, c)
        })
        const loadStart = async () => {
                if (image) return image
                image = new Image()
                image.crossOrigin = 'anonymous'
                const loaded = new Promise<HTMLImageElement>((resolve) => {
                        image.onload = () => resolve(image)
                })
                image.src = urlOfFrame(i, j)
                await loaded
                return image
        }
        const load = (MVP: m.mat4, ctx: CanvasRenderingContext2D, mesh: Mesh, i = 0) => {
                chunks.forEach((c) => {
                        if (!cullChunk(MVP, x, y, z, c.x, c.y, c.z)) return
                        c.load(x, y, z, ctx)
                        mesh.pos.push(...c.pos)
                        mesh.scl.push(...c.scl)
                        mesh.cnt += c.cnt()
                        for (let n = 0; n < c.cnt(); n++) mesh.aid.push(i)
                })
        }
        return { i, j, x, y, z, slot, chunks, loadStart, load }
}
const createSlot = (index = 0) => {
        const ctx = createContext()
        let tex: WebGLTexture
        let atlas: WebGLUniformLocation
        let offset: WebGLUniformLocation
        let region: Region | null = null
        const apply = (c: WebGL2RenderingContext, pg: WebGLProgram, img: HTMLImageElement) => {
                ctx.clearRect(0, 0, 4096, 4096)
                ctx.drawImage(img, 0, 0, 4096, 4096)
                if (!atlas) atlas = c.getUniformLocation(pg, `iAtlas${index}`)
                if (!offset) offset = c.getUniformLocation(pg, `iOffset${index}`)
                if (!atlas || !offset) return
                if (!tex) {
                        tex = c.createTexture()
                        if (!tex) return
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
                c.texImage2D(c.TEXTURE_2D, 0, c.RGBA, c.RGBA, c.UNSIGNED_BYTE, img) // Do not use ctx.canvas, as some image data will be lost
                c.uniform1i(atlas, index)
                c.uniform3fv(offset, new Float32Array([region.x, region.y, region.z]))
        }
        const release = () => {
                if (!region) return
                region.slot = -1
                region = void 0
        }
        return { apply, release, getCtx: () => ctx, getRegion: () => region, setRegion: (r: Region) => (region = r) }
}
const createSlots = () => {
        const owner = range(SLOT).map(createSlot)
        const assign = async (MVP: m.mat4, mesh: Mesh, r: Region, gl: GL) => {
                let i = r.slot
                if (i < 0) {
                        i = owner.findIndex((slot) => !slot?.getRegion())
                        if (i < 0) return
                        const slot = owner[i]
                        slot.setRegion(r)
                        r.slot = i
                        const img = await r.loadStart()
                        if (owner[i].getRegion() !== r || r.slot !== i) return
                        const c = gl.webgl.context as WebGL2RenderingContext
                        const pg = gl.webgl.program as WebGLProgram
                        if (!pg) return
                        c.useProgram(pg)
                        slot.apply(c, pg, img)
                }
                if (owner[i]) r.load(MVP, owner[i].getCtx(), mesh, i)
        }
        const release = (keep: Set<Region>) => {
                for (let i = 0; i < owner.length; i++) {
                        const slot = owner[i]
                        if (!slot) continue
                        if (keep.has(slot.getRegion())) continue
                        slot.release()
                }
        }
        return { assign, release }
}
const createViewer = () => {
        const cam = { position: m.vec3.fromValues(CAMERA_X, CAMERA_Y, CAMERA_Z), target: m.vec3.fromValues(CAMERA_X + TARGET_X, TARGET_Y, CAMERA_Z), up: m.vec3.fromValues(0, 1, 0), fov: 60, near: 0.1, far: 4000 }
        const mesh = { vertex: VERTEX, normal: NORMAL, pos: [0, 0, 0], scl: [0, 0, 0], aid: [0], count: 36, cnt: 1, _buf: {} }
        let t0 = performance.now()
        let MVP: m.mat4
        let dist = 0
        let prev = t0
        let isLoading = false
        const shader = createShader(mesh)
        const slots = createSlots()
        const regions = new Map<number, Region>()
        const ensureRegion = (rx = RX0, ry = RY0) => {
                const id = regionId(rx, ry)
                const got = regions.get(id)
                if (got) return got
                const r = createRegion(rx, ry, -1)
                regions.set(id, r)
                return r
        }
        const visRegions = () => {
                const keep = new Set(windowCoords(cam, MVP).map(([x, y]) => ensureRegion(x, y)))
                for (const [id, r] of regions) if (!keep.has(r)) regions.delete(id)
                return keep
        }
        const asdw = (axis = 0, delta = 0) => (dir[axis] = delta)
        const resize = (gl: GL) => {
                MVP = perspective(cam, gl.size[0] / gl.size[1], MVP)
                shader.iMVP.value = [...MVP]
        }
        const dir = m.vec3.create()
        const render = async (gl: GL) => {
                const t1 = performance.now()
                const dt = (t1 - t0) / 1000
                dist -= dt * SPEED
                cam.position[0] = cam.target[0] = CAMERA_X + dist
                if (cam.position[0] < 0) cam.position[0] = ROW * REGION
                cam.target[0] += TARGET_X
                cam.position[0] += dir[0]
                cam.position[1] += dir[1]
                cam.position[2] += dir[2]
                cam.target[0] += dir[0]
                cam.target[2] += dir[2]
                t0 = t1
                MVP = perspective(cam, gl.size[0] / gl.size[1], MVP)
                shader.iMVP.value = [...MVP]
                if (t1 - prev < 100) return
                prev = t1
                if (isLoading) return
                isLoading = true
                mesh.pos.length = mesh.scl.length = mesh.aid.length = mesh.cnt = 0
                const keep = visRegions()
                await Promise.all(Array.from(keep).map((r) => slots.assign(MVP, mesh, r, gl)))
                if (!mesh.cnt) {
                        mesh.pos = [0, 0, 0]
                        mesh.scl = [0, 0, 0]
                        mesh.aid = [0]
                        mesh.cnt = 1
                }
                applyInstances(gl, mesh)
                slots.release(keep)
                isLoading = false
        }
        return { vert: shader.vert, frag: shader.frag, count: mesh.count, instanceCount: mesh.cnt, render, resize, asdw }
}

/**
 * App
 */
const Canvas = ({ viewer }: { viewer: Viewer }) => {
        const gl = useGL({
                isWebGL: true,
                isDepth: true,
                // isDebug: true,
                // wireframe: true,
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
                        const press = (isPress: boolean, e: any) => {
                                if (e.key === 'w') viewer.asdw(1, isPress ? 1 : 0)
                                if (e.key === 's') viewer.asdw(1, isPress ? -1 : 0)
                                if (e.key === 'a') viewer.asdw(2, isPress ? -1 : 0)
                                if (e.key === 'd') viewer.asdw(2, isPress ? 1 : 0)
                        }
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
const windowCoords = (cam: Camera, VPmat: m.mat4) => {
        const cx = cam.position[0]
        const cz = cam.position[2]
        const clampi = (x: number, a: number, b: number) => (x < a ? a : x > b ? b : x)
        const start: [number, number] = [clampi(RX0 + Math.floor(cx / REGION), RX0, RX1), clampi(RY1 - Math.floor(cz / REGION), RY0, RY1)]
        const q: [number, number][] = [start]
        const seen = new Set<string>([start.join(',')])
        const list: { i: number; j: number; d: number }[] = []
        const need = SLOT * 2
        const add = (i: number, j: number) => {
                const [x, y, z] = offOf(i, j)
                if (!cullRegion(VPmat, x, y, z)) return
                const dx = x + 128 - cx
                const dz = z + 128 - cz
                list.push({ i, j, d: Math.hypot(dx, dz) })
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
        return list.slice(0, SLOT).map((e) => [e.i, e.j] as [number, number])
}
const applyInstances = (gl: GL, mesh: Mesh) => {
        const c = gl.webgl.context as WebGL2RenderingContext
        const pg = gl.webgl.program as WebGLProgram
        const bufs = mesh._buf as any
        const bindAttrib = (key: string, data: number[], size: number) => {
                const loc = c.getAttribLocation(pg, key)
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
type Viewer = ReturnType<typeof createViewer>
type Chunk = ReturnType<typeof createChunk>
type Region = ReturnType<typeof createRegion>
