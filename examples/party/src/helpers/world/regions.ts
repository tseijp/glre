import { chunkId, importWasm, GRID, CHUNK } from '../utils'
import { atlasToVox, encodePng, itemsToVox, stitchAtlas } from '../voxel/atlas'
import { loader } from '../voxel/loader'
import { createChunks, gather, meshing } from './chunk'
import type { Camera } from '../player/camera'

// @TODO FIX
const toTile = (lat = 0, lng = 0, z = 0) => {
        const s = Math.sin((lat * Math.PI) / 180)
        const n = 1 << z
        const x = Math.floor(((lng + 180) / 360) * n)
        const y = Math.floor(((1 - Math.log((1 + s) / (1 - s)) / Math.PI) / 2) * n)
        return { i: x, j: y, k: z }
}

const fillChunk = (vox: Map<string, Uint8Array>) => {
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
        // @TODO culling
        const mesh = gather(chunks)
        return { mesh, chunks }
}

export type RegionConfig = {
        lat: number
        lng: number
        zoom: number
}

export const createRegions = (config: RegionConfig = { lat: 35.6762, lng: 139.6503, zoom: 15 }) => {
        const keys: string[] = []
        const seen = new Set<string>()
        const R = CHUNK * GRID[0]
        const toKey = (lat: number, lng: number, zoom: number, rx: number, rz: number) => `vox|${lat.toFixed(4)}|${lng.toFixed(4)}|${zoom}|${rx}|${rz}`
        const fromKey = (key: string) => {
                const [, a, b, z, rx, rz] = key.split('|')
                return { lat: parseFloat(a), lng: parseFloat(b), zoom: parseInt(z) | 0, rx: parseInt(rx) | 0, rz: parseInt(rz) | 0 }
        }
        const ensure = (lat: number, lng: number, zoom: number, rx: number, rz: number) => {
                const k = toKey(lat, lng, zoom, rx, rz)
                if (seen.has(k)) return
                seen.add(k)
                keys.push(k)
        }
        const seed = () => ensure(config.lat, config.lng, config.zoom, 0, 0)
        const getKey = (index: number) => {
                if (!keys.length) seed()
                return keys[index] || null
        }
        const fetcher = async (key: string) => {
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
                        const reg = { atlas: { src: q, W: 4096, H: 4096, planeW: 1024, planeH: 1024, cols: 4 }, i, j, k, x, y, z, lat, lng, zoom, ...fillChunk(vox) }
                        return reg
                }
                const wasm: any = await importWasm()
                const glb = await fetch('/model/untitled.glb')
                const buf = await glb.arrayBuffer()
                const parsed = await loader(buf)
                const items = wasm.voxelize_glb(parsed, 16, 16, 16)
                const png = await encodePng(stitchAtlas(items), 4096, 4096)
                await Promise.all([fetch(q, { method: 'PUT', body: png }), fetch('/api/v1/region', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ world: 'default', i, j, k, url: `atlas/${Number(lat).toFixed(4)}_${Number(lng).toFixed(4)}_${zoom}.png` }) })])
                const vox = itemsToVox(items)
                const reg = { atlas: { src: q, W: 4096, H: 4096, planeW: 1024, planeH: 1024, cols: 4 }, i, j, k, x, y, z, lat, lng, zoom, ...fillChunk(vox) }
                return reg
        }
        const updateCamera = (camera: Camera, setSize: (n: number) => any) => {
                const rx = Math.floor(camera.position[0] / R)
                const rz = Math.floor(camera.position[2] / R)
                const d = 2
                const dp: [number, number][] = []
                for (let z = -d; z <= d; z++) for (let x = -d; x <= d; x++) dp.push([rx + x, rz + z])
                dp.sort((a, b) => Math.hypot(a[0] - rx, a[1] - rz) - Math.hypot(b[0] - rx, b[1] - rz))
                const deg = 0.0023
                const need: string[] = []
                for (let i = 0; i < dp.length && need.length < 8; i++) {
                        const [x, z] = dp[i]
                        const lat = config.lat + z * deg
                        const lng = config.lng + x * deg
                        need.push(toKey(lat, lng, config.zoom, x, z))
                }
                for (const k of need)
                        if (!seen.has(k)) {
                                seen.add(k)
                                keys.push(k)
                        }
                if (keys.length > 8) keys.splice(0, keys.length - 8)
                setSize(keys.length)
        }
        return { getKey, fetcher, updateCamera }
}
