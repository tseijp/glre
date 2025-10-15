import { eulerView } from './../../../../../packages/core/src/addons/space/eulerView'
import { chunkId, importWasm, GRID, CHUNK, timer as _ } from '../utils'
import { atlasToVox, encodePng, itemsToVox, stitchAtlas } from '../voxel/atlas'
import { loader } from '../voxel/loader'
import { createChunks, gather, meshing } from './chunk'
import type { Camera } from '../player/camera'
import { culling } from '../voxel/culling'
import type { Region } from '../types'

// @TODO FIX
const toTile = (lat = 0, lng = 0, z = 0) => {
        const s = Math.sin((lat * Math.PI) / 180)
        const n = 1 << z
        const x = Math.floor(((lng + 180) / 360) * n)
        const y = Math.floor(((1 - Math.log((1 + s) / (1 - s)) / Math.PI) / 2) * n)
        return { i: x, j: y, k: z }
}

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
                ch.visible = true
                ch.dirty = true
                ch.gen = true
        }
        meshing(chunks)
        culling(chunks, camera)
        const mesh = gather(chunks)
        return { mesh, chunks }
}

export type RegionConfig = {
        lat: number
        lng: number
        zoom: number
}

export const createRegions = (camera: Camera, config: RegionConfig = { lat: 35.6762, lng: 139.6503, zoom: 15 }) => {
        const regionMap = new Map<string, { key: string; visible: boolean; fetched: boolean }>()
        const R = CHUNK * GRID[0]
        const DEG_PER_REGION = 0.0023
        const toKey = (lat: number, lng: number, zoom: number, rx: number, rz: number) => `vox|${lat.toFixed(4)}|${lng.toFixed(4)}|${zoom}|${rx}|${rz}`
        const fromKey = (key: string) => {
                const [, a, b, z, rx, rz] = key.split('|')
                return { lat: parseFloat(a), lng: parseFloat(b), zoom: parseInt(z) | 0, rx: parseInt(rx) | 0, rz: parseInt(rz) | 0 }
        }
        const regionCulling = (rx: number, rz: number, camera: Camera) => {
                const regionX = rx * R
                const regionZ = rz * R
                const dx = camera.position[0] - (regionX + R * 0.5)
                const dz = camera.position[2] - (regionZ + R * 0.5)
                const dist = Math.sqrt(dx * dx + dz * dz)
                const viewDist = camera.far + R * Math.sqrt(2)
                return dist < viewDist
        }
        const getKey = (index: number) => {
                const visibleKeys = Array.from(regionMap.values())
                        .filter((r) => r.visible && !r.fetched)
                        .map((r) => r.key)
                console.log(visibleKeys[index] || null)
                return visibleKeys[index] || null
        }
        const fetcher = async (key: string) => {
                const entry = regionMap.get(key)
                if (entry) entry.fetched = true
                const { lat, lng, zoom, rx, rz } = fromKey(key)
                const q = `/api/v1/atlas?lat=${lat}&lng=${lng}&zoom=${zoom}`
                const head = await fetch(q, { method: 'HEAD' })
                const { i, j, k } = toTile(lat, lng, zoom)
                const x = rx * R
                const y = 0
                const z = rz * R
                if (head.ok) {
                        const res = await fetch(q)
                        const ab = await res.arrayBuffer()
                        const vox = await atlasToVox(ab)
                        const reg = { atlas: { src: q, W: 4096, H: 4096, planeW: 1024, planeH: 1024, cols: 4 }, i, j, k, x, y, z, lat, lng, zoom, visible: true, ...fillChunk(camera, vox) }
                        return reg
                }
                try {
                        const wasm: any = await importWasm()
                        const glb = await _('/model/torus.glb', fetch)('/model/torus.glb')
                        const buf = await glb.arrayBuffer()
                        const parsed = await _('loader', loader)(buf)
                        const items = wasm.voxelize_glb(parsed, 16, 16, 16)
                        const png = await _('encodePng', encodePng)(stitchAtlas(items), 4096, 4096)
                        await Promise.all([_(q, fetch)(q, { method: 'PUT', body: png }), _('/api/v1/region', fetch)('/api/v1/region', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ world: 'default', i, j, k, url: `atlas/${Number(lat).toFixed(4)}_${Number(lng).toFixed(4)}_${zoom}.png` }) })])
                        const vox = itemsToVox(items)
                        const reg = { atlas: { src: q, W: 4096, H: 4096, planeW: 1024, planeH: 1024, cols: 4 }, i, j, k, x, y, z, lat, lng, zoom, visible: true, ...fillChunk(camera, vox) }
                        return reg
                } catch (error) {
                        console.warn(error)
                }
        }
        const updateCamera = (camera: Camera, setSize: (n: number) => any) => {
                const rx = Math.floor(camera.position[0] / R)
                const rz = Math.floor(camera.position[2] / R)
                const d = 2
                for (let z = -d; z <= d; z++) {
                        for (let x = -d; x <= d; x++) {
                                const regionRx = rx + x
                                const regionRz = rz + z
                                const isVisible = regionCulling(regionRx, regionRz, camera)
                                const lat = config.lat + regionRz * DEG_PER_REGION
                                const lng = config.lng + regionRx * DEG_PER_REGION
                                const key = toKey(lat, lng, config.zoom, regionRx, regionRz)
                                const existing = regionMap.get(key)
                                if (existing) {
                                        existing.visible = isVisible
                                } else if (isVisible) {
                                        regionMap.set(key, { key, visible: true, fetched: false })
                                }
                        }
                }
                const unfetchedCount = Array.from(regionMap.values()).filter((r) => r.visible && !r.fetched).length
                setSize(unfetchedCount)
        }
        const seed = () => {
                const rx = Math.floor(camera.position[0] / R)
                const rz = Math.floor(camera.position[2] / R)
                const d = 2
                for (let z = -d; z <= d; z++) {
                        for (let x = -d; x <= d; x++) {
                                const regionRx = rx + x
                                const regionRz = rz + z
                                const isVisible = regionCulling(regionRx, regionRz, camera)
                                if (isVisible) {
                                        const lat = config.lat + regionRz * DEG_PER_REGION
                                        const lng = config.lng + regionRx * DEG_PER_REGION
                                        const key = toKey(lat, lng, config.zoom, regionRx, regionRz)
                                        regionMap.set(key, { key, visible: true, fetched: false })
                                }
                        }
                }
        }
        seed()
        return { getKey, fetcher, updateCamera }
}
