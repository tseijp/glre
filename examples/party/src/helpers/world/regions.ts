import { mat4, vec3 } from 'gl-matrix'
import { chunkId, GRID, CHUNK, timer as _ } from '../utils'
import { calculateRegionLatLng } from '../voxel/google'
import { atlasToVox } from '../voxel/atlas'
import { createChunks, gather, meshing } from './chunk'
import { culling, visSphereRegion } from '../voxel/culling'
import type { Camera } from '../player/camera'
import type { Region } from '../types'

const fillChunk = (camera: Camera, vox: Map<string, Uint8Array>, doMesh = true) => {
        const chunks = createChunks()
        for (const [k, rgba] of vox) {
                const [ci, cz, cy] = k.split('.').map((v: string) => parseInt(v) | 0)
                const id = chunkId(ci, cy, cz)
                const ch = chunks.get(id)
                if (!ch) continue
                const out = new Uint8Array(16 * 16 * 16)
                for (let t = 0, v = 3; t < out.length; t++, v += 4) out[t] = rgba[v] > 0 ? 1 : 0
                ch.vox.set(out)
                ch.dirty = true
                ch.gen = true
        }
        if (!doMesh) {
                const mesh = { pos: [0, 0, 0], scl: [0, 0, 0], cnt: 1 } as any
                return { mesh, chunks }
        }
        culling(chunks, camera)
        meshing(chunks)
        const mesh = gather(chunks)
        return { mesh, chunks }
}

export const createRegions = (camera: Camera) => {
        const regionMap = new Map<string, Region>()
        const R = CHUNK * GRID[0]
        let updateTime = 0
        let timeoutId: NodeJS.Timeout | null = null
        const activeKeys = new Set<string>()
        let lastCamKey = ''
        const toKey = (rx: number, rz: number) => `vox|${rx}|${rz}`
        const fromKey = (key: string) => {
                const [, rx, rz] = key.split('|')
                return { rx: parseInt(rx) | 0, rz: parseInt(rz) | 0 }
        }
        const _ctrR = vec3.create()
        const _ctrTmp = vec3.create()
        const camKey = (cam: Camera) => {
                const px = (cam.position[0] / 8) | 0
                const py = (cam.position[1] / 8) | 0
                const pz = (cam.position[2] / 8) | 0
                const tx = (cam.target[0] / 8) | 0
                const ty = (cam.target[1] / 8) | 0
                const tz = (cam.target[2] / 8) | 0
                return `${px}|${py}|${pz}|${tx}|${ty}|${tz}`
        }
        const offKey = (cam: Camera, reg: { x: number; y: number; z: number }) => {
                const px = ((cam.position[0] - reg.x) / CHUNK) | 0
                const py = ((cam.position[1] - reg.y) / CHUNK) | 0
                const pz = ((cam.position[2] - reg.z) / CHUNK) | 0
                const tx = ((cam.target[0] - reg.x) / CHUNK) | 0
                const ty = ((cam.target[1] - reg.y) / CHUNK) | 0
                const tz = ((cam.target[2] - reg.z) / CHUNK) | 0
                return `${px}|${py}|${pz}|${tx}|${ty}|${tz}`
        }
        const regionCulling = (rx: number, rz: number, cam: Camera) => {
                const regionX = rx * R
                const regionZ = -rz * R
                vec3.set(_ctrR, regionX + R * 0.5, R * 0.5, regionZ + R * 0.5)
                if (vec3.sqrDist(_ctrR, cam.position) > cam.far * cam.far) return false
                const RAD = R * Math.sqrt(3) * 0.5
                return visSphereRegion(cam.VP, _ctrR, RAD)
        }
        const getVisibleKeys = (currentCamera: Camera) => {
                const rx = Math.floor(currentCamera.position[0] / R)
                const rz = Math.floor(-currentCamera.position[2] / R)
                const keys = []
                const checkRange = 2
                for (let z = -checkRange; z <= checkRange; z++) {
                        for (let x = -checkRange; x <= checkRange; x++) {
                                const regionRx = rx + x
                                const regionRz = rz + z
                                if (regionCulling(regionRx, regionRz, currentCamera)) {
                                        const key = toKey(regionRx, regionRz)
                                        if (!regionMap.has(key)) keys.push(key)
                                }
                        }
                }
                return keys
        }
        const getPrefetchKeys = (currentCamera: Camera, limit = 2) => {
                const rx = Math.floor(currentCamera.position[0] / R)
                const rz = Math.floor(-currentCamera.position[2] / R)
                const cand: { key: string; d2: number }[] = []
                const range = 3
                for (let z = -range; z <= range; z++)
                        for (let x = -range; x <= range; x++) {
                                const regionRx = rx + x
                                const regionRz = rz + z
                                const key = toKey(regionRx, regionRz)
                                if (regionMap.has(key)) continue
                                vec3.set(_ctrTmp, regionRx * R + R * 0.5, R * 0.5, -regionRz * R + R * 0.5)
                                const d2 = vec3.sqrDist(_ctrTmp, currentCamera.position)
                                cand.push({ key, d2 })
                        }
                cand.sort((a, b) => a.d2 - b.d2)
                const out: string[] = []
                for (let i = 0; i < cand.length && out.length < limit; i++) out.push(cand[i].key)
                return out
        }
        const fetchRegion = async (key: string) => {
                if (regionMap.has(key)) return regionMap.get(key)
                const { rx, rz } = fromKey(key)
                if (rx < 0) return
                if (rz < 0) return
                // if (1 <= rx) return
                // if (1 <= rz) return
                // if (96 <= rx) return
                if (96 <= rx) return
                if (5 <= rz) return
                // const rx2 = ((rx % 4) + 4) % 4
                // const rz2 = ((rz % 4) + 4) % 4
                // const rx2 = (((rx % 4) + 4) % 4) + 76
                const rx2 = (((rx % 96) + 96) % 96) + 28 // 28 ~ 123 の 96 個
                const rz2 = (((rz % 5) + 5) % 5) + 75
                console.log({ rx, rz, rx2, rz2 })
                // const rz2 = (((rz % 12) + 12) % 12) + 72 // or 80
                // const rx2 = 76 // (((rx % 4) + 4) % 4) + 76
                // const rz2 = 76 // (((rz % 4) + 4) % 4) + 76
                const q = `/logs/${rx2}_${rz2}.png`
                const coord = calculateRegionLatLng(rx, rz)
                const ab = await (await fetch(q)).arrayBuffer()
                const atlas = { src: q, W: 4096, H: 4096, planeW: 1024, planeH: 1024, cols: 4, buf: ab }
                const visibleNow = true // regionCulling(rx, rz, camera)
                if (!visibleNow) {
                        const reg = { atlas, i: rx, j: 0, k: rz, x: rx * R, y: 0, z: -rz * R, lat: coord.lat, lng: coord.lng, zoom: 15, visible: false } as any
                        regionMap.set(key, reg as Region)
                        return reg
                }
                const vox = await atlasToVox(ab)
                const { mesh, chunks } = fillChunk(camera, vox, true)
                const reg = { atlas, i: rx, j: 0, k: rz, x: rx * R, y: 0, z: -rz * R, lat: coord.lat, lng: coord.lng, zoom: 15, visible: true, mesh, chunks } as any
                regionMap.set(key, reg as Region)
                activeKeys.add(key)
                return reg
        }
        const fetchRegions = async () => Array.from(regionMap.values())
        const _offPos = vec3.create()
        const _offTgt = vec3.create()
        const _V = mat4.create()
        const _VP = mat4.create()
        const _up = vec3.fromValues(0, 1, 0)
        const ensureBuilt = async (reg: any, cam: Camera) => {
                if (reg.chunks && reg.mesh) return reg
                let vox: Map<string, Uint8Array> | undefined = reg._vox
                if (!vox && reg.atlas && reg.atlas.buf) vox = await atlasToVox(reg.atlas.buf)
                if (!vox) return reg
                const r = fillChunk(cam, vox, true)
                reg.mesh = r.mesh
                reg.chunks = r.chunks
                reg._vox = undefined
                return reg
        }
        const updateCamera = (cam: Camera, mutate?: any) => {
                const now = Date.now()
                if (now - updateTime < 100) return
                updateTime = now
                if (timeoutId) clearTimeout(timeoutId)
                timeoutId = setTimeout(async () => {
                        let hasChanges = false
                        const kNow = camKey(cam)
                        const visKeys = getVisibleKeys(cam)
                        const preKeys = getPrefetchKeys(cam, 2)
                        if (kNow === lastCamKey && visKeys.length === 0 && preKeys.length === 0) {
                                if (mutate) mutate()
                                return
                        }
                        const rx = Math.floor(cam.position[0] / R)
                        const rz = Math.floor(-cam.position[2] / R)
                        const cand = new Set<string>()
                        for (let z = -3; z <= 3; z++) for (let x = -3; x <= 3; x++) cand.add(toKey(rx + x, rz + z))
                        const scan = new Set<string>()
                        activeKeys.forEach((k) => scan.add(k))
                        cand.forEach((k) => scan.add(k))
                        scan.forEach(async (key) => {
                                const reg = regionMap.get(key)
                                if (!reg) return
                                const { rx: rrx, rz: rrz } = fromKey(key)
                                const wasVisible = reg.visible
                                const nowVisible = regionCulling(rrx, rrz, cam)
                                if (wasVisible !== nowVisible) {
                                        reg.visible = nowVisible
                                        hasChanges = true
                                }
                                if (!nowVisible) {
                                        activeKeys.delete(key)
                                        return
                                }
                                activeKeys.add(key)
                                await ensureBuilt(reg, cam)
                                if (!reg.chunks) return
                                const relKey = offKey(cam, reg as any)
                                if ((reg as any)._lastKey === relKey) return
                                vec3.set(_offPos, cam.position[0] - reg.x, cam.position[1] - reg.y, cam.position[2] - reg.z)
                                vec3.set(_offTgt, cam.target[0] - reg.x, cam.target[1] - reg.y, cam.target[2] - reg.z)
                                mat4.lookAt(_V, _offPos, _offTgt, _up)
                                mat4.multiply(_VP, cam.P, _V)
                                const offCam = { ...cam, position: _offPos, target: _offTgt, V: _V, VP: _VP } as any
                                culling(reg.chunks, offCam, relKey)
                                meshing(reg.chunks)
                                ;(reg as any)._lastKey = relKey
                        })
                        const newKeys = visKeys.concat(preKeys)
                        if (newKeys.length > 0) {
                                await Promise.all(newKeys.map(fetchRegion))
                                hasChanges = true
                        }
                        lastCamKey = kNow
                        if (hasChanges && mutate) mutate()
                }, 10)
        }
        const getRegions = () => Array.from(regionMap.values()).filter((r) => r.visible)
        const initialKeys = [...getVisibleKeys(camera), ...getPrefetchKeys(camera, 2)]
        return { getRegions, fetchRegion, fetchRegions, updateCamera, initialKeys }
}
