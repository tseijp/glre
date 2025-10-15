import { chunkId, importWasm, GRID, CHUNK, timer as _ } from '../utils'
import { atlasToVox, encodePng, itemsToVox, stitchAtlas } from '../voxel/atlas'
import { loader } from '../voxel/loader'
import { createChunks, gather, meshing } from './chunk'
import type { Camera } from '../player/camera'
import { culling, visSphereRegion } from '../voxel/culling'
import type { Region } from '../types'
import { vec3 } from 'gl-matrix'

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
        let lastUpdateTime = 0
        let debounceTimeout: NodeJS.Timeout | null = null
        const toKey = (rx: number, rz: number) => `vox|${rx}|${rz}`
        const fromKey = (key: string) => {
                const [, rx, rz] = key.split('|')
                return { rx: parseInt(rx) | 0, rz: parseInt(rz) | 0 }
        }
        const regionCulling = (rx: number, rz: number, camera: Camera) => {
                const regionX = rx * R
                const regionZ = rz * R
                const ctr = vec3.fromValues(regionX + R * 0.5, R * 0.5, regionZ + R * 0.5)
                if (vec3.sqrDist(ctr, camera.position) > camera.far * camera.far) return false
                const RAD = R * Math.sqrt(3) * 0.5
                return visSphereRegion(camera.VP, ctr, RAD)
        }
        const getVisibleKeys = () => {
                const rx = Math.floor(camera.position[0] / R)
                const rz = Math.floor(camera.position[2] / R)
                const keys = []
                const d = 2
                for (let z = -d; z <= d; z++) {
                        for (let x = -d; x <= d; x++) {
                                const regionRx = rx + x
                                const regionRz = rz + z
                                if (regionCulling(regionRx, regionRz, camera)) {
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
                const q = `/api/v1/atlas?rx=${rx}&rz=${rz}`
                const head = await fetch(q, { method: 'HEAD' })
                const x = rx * R
                const y = 0
                const z = rz * R
                const atlas = { src: q, W: 4096, H: 4096, planeW: 1024, planeH: 1024, cols: 4 }
                let vox
                if (head.ok) {
                        const res = await _(q, fetch)(q)
                        vox = await atlasToVox(await res.arrayBuffer())
                } else {
                        const wasm: any = await importWasm()
                        const buf = await (await _('/model/*.glb', fetch)('/model/sphere.glb')).arrayBuffer()
                        const items = wasm.voxelize_glb(await _('loader', loader)(buf), 16, 16, 16)
                        const png = await _('encodePng', encodePng)(stitchAtlas(items), 4096, 4096)
                        await Promise.all([_(q, fetch)(q, { method: 'PUT', body: png }), _('/api/v1/region', fetch)('/api/v1/region', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ world: 'default', i: rx, j: 0, k: rz, url: `atlas/${rx}_${rz}.png` }) })])
                        vox = itemsToVox(items)
                }
                if (!vox) return
                const { mesh, chunks } = fillChunk(camera, vox)
                const reg = { atlas, i: rx, j: 0, k: rz, x, y, z, lat: 0, lng: 0, zoom: 0, visible: regionCulling(rx, rz, camera), mesh, chunks }
                regionMap.set(key, reg as Region)
                return reg
        }
        const fetchRegions = async () => Array.from(regionMap.values())
        const updateCamera = (camera: Camera, mutate?: any) => {
                const now = Date.now()
                if (now - lastUpdateTime < 100) return
                lastUpdateTime = now
                if (debounceTimeout) clearTimeout(debounceTimeout)
                debounceTimeout = setTimeout(async () => {
                        for (const [key, region] of regionMap.entries()) {
                                const { rx, rz } = fromKey(key)
                                region.visible = regionCulling(rx, rz, camera)
                        }
                        for (const key of getVisibleKeys()) await fetchRegion(key)
                        if (mutate) mutate()
                }, 300)
        }
        const getRegions = () => Array.from(regionMap.values()).filter((r) => r.visible)
        const initialKeys = getVisibleKeys()
        return { getRegions, fetchRegion, fetchRegions, updateCamera, initialKeys }
}
