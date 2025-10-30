import { chunkId, importWasm, GRID, CHUNK, timer as _, importModel } from '../utils'
import { loadGoogleTile3D, calculateRegionLatLng } from '../voxel/google'
import { atlasToVox, encodePng, itemsToVox, stitchAtlas } from '../voxel/atlas'
import { loader } from '../voxel/loader'
import { createChunks, gather, meshing } from './chunk'
import type { Camera } from '../player/camera'
import { culling, visSphereRegion } from '../voxel/culling'
import type { Region } from '../types'
import { mat4, vec3 } from 'gl-matrix'

const fillChunk = (camera: Camera, vox: Map<string, Uint8Array>) => {
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
        const toKey = (rx: number, rz: number) => `vox|${rx}|${rz}`
        const fromKey = (key: string) => {
                const [, rx, rz] = key.split('|')
                return { rx: parseInt(rx) | 0, rz: parseInt(rz) | 0 }
        }
        const _ctrR = vec3.create()
        const regionCulling = (rx: number, rz: number, cam: Camera) => {
                const regionX = rx * R
                const regionZ = rz * R
                vec3.set(_ctrR, regionX + R * 0.5, R * 0.5, regionZ + R * 0.5)
                if (vec3.sqrDist(_ctrR, cam.position) > cam.far * cam.far) return false
                const RAD = R * Math.sqrt(3) * 0.5
                return visSphereRegion(cam.VP, _ctrR, RAD)
        }
        const getVisibleKeys = (currentCamera: Camera) => {
                const rx = Math.floor(currentCamera.position[0] / R)
                const rz = Math.floor(currentCamera.position[2] / R)
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
        const fetchRegion = async (key: string) => {
                if (regionMap.has(key)) return regionMap.get(key)
                const { rx, rz } = fromKey(key)
                const rx2 = (((rx % 4) + 4) % 4) + 76
                const rz2 = (((rx % 4) + 4) % 4) + 76
                const q = `/logs/${rx2}_${rz2}.png`
                const coord = calculateRegionLatLng(rx, rz)
                const ab = await (await fetch(q)).arrayBuffer()
                const vox = await atlasToVox(ab)
                const atlas = { src: q, W: 4096, H: 4096, planeW: 1024, planeH: 1024, cols: 4, buf: ab }
                const { mesh, chunks } = fillChunk(camera, vox)
                const reg = { atlas, i: rx, j: 0, k: rz, x: rx * R, y: 0, z: rz * R, lat: coord.lat, lng: coord.lng, zoom: 15, visible: regionCulling(rx, rz, camera), mesh, chunks }
                regionMap.set(key, reg as Region)
                return reg
        }
        const fetchRegions = async () => Array.from(regionMap.values())
        const _offPos = vec3.create()
        const _offTgt = vec3.create()
        const _V = mat4.create()
        const _VP = mat4.create()
        const _up = vec3.fromValues(0, 1, 0)
        const updateCamera = (cam: Camera, mutate?: any) => {
                const now = Date.now()
                if (now - updateTime < 100) return
                updateTime = now
                if (timeoutId) clearTimeout(timeoutId)
                timeoutId = setTimeout(async () => {
                        let hasChanges = false
                        for (const [key, region] of regionMap.entries()) {
                                const { rx, rz } = fromKey(key)
                                const wasVisible = region.visible
                                region.visible = regionCulling(rx, rz, cam)
                                if (wasVisible !== region.visible) hasChanges = true
                                if (region.visible && region.chunks) {
                                        vec3.set(_offPos, cam.position[0] - region.x, cam.position[1] - region.y, cam.position[2] - region.z)
                                        vec3.set(_offTgt, cam.target[0] - region.x, cam.target[1] - region.y, cam.target[2] - region.z)
                                        mat4.lookAt(_V, _offPos, _offTgt, _up)
                                        mat4.multiply(_VP, cam.P, _V)
                                        const offCam = { ...cam, position: _offPos, target: _offTgt, V: _V, VP: _VP } as any
                                        culling(region.chunks, offCam)
                                        meshing(region.chunks)
                                }
                        }
                        const newKeys = getVisibleKeys(cam)
                        if (newKeys.length > 0) {
                                for (const key of newKeys) await fetchRegion(key)
                                hasChanges = true
                        }
                        if (hasChanges && mutate) mutate()
                }, 10)
        }
        const getRegions = () => Array.from(regionMap.values()).filter((r) => r.visible)
        const initialKeys = getVisibleKeys(camera)
        return { getRegions, fetchRegion, fetchRegions, updateCamera, initialKeys }
}
