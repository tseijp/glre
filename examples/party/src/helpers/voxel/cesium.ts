import { load } from '@loaders.gl/core'
import { GLTFLoader, postProcessGLTF } from '@loaders.gl/gltf'
import { ext } from './b3dm'
import { buildFromGLTF } from './gltf'

const pickDeepB3dm = (tileset: any) => {
        const q: any[] = []
        q.push(tileset?.root || {})
        const cand: { uri: string; ge: number }[] = []
        while (q.length) {
                const n = q.shift()
                if (!n) continue
                const ge = Number(n.geometricError || Infinity)
                const push = (cc: any) => {
                        const u = cc?.uri || cc?.url || ''
                        if (u && (u.endsWith('.b3dm') || u.endsWith('.B3DM') || u.endsWith('.glb') || u.endsWith('.gltf'))) cand.push({ uri: u, ge })
                }
                if (n.content) push(n.content)
                if (Array.isArray(n.contents)) for (const cc of n.contents) push(cc)
                if (Array.isArray(n.children)) for (const ch of n.children) q.push(ch)
        }
        if (cand.length === 0) return ''
        cand.sort((a, b) => (a.ge === b.ge ? a.uri.length - b.uri.length : a.ge - b.ge))
        return cand[0].uri
}

export const loadCesiumTiles = async (assetId: number) => {
        const tsRes = await fetch(`/api/v1/cesium/${assetId}/tileset`)
        if (!tsRes.ok) throw new Error(`Error: /api/v1/cesium/${assetId}/tileset res is not ok`)
        const tileset: any = await tsRes.json()
        const uri = pickDeepB3dm(tileset)
        if (!uri) throw new Error('Error: no content uri found')
        const raw = await fetch(`/api/v1/cesium/${assetId}/content?src=${encodeURIComponent(uri)}`).then((r) => r.arrayBuffer())
        const isB3dm = uri.endsWith('.b3dm') || uri.endsWith('.B3DM')
        const glb = isB3dm ? ext(raw) : raw

        // ↓↓↓ (DO NOT CHANGE) ↓↓↓
        // console.log(JSON.stringify({ tileset, uri, raw, isB3dm, glb }))
        // ↑↑ (DO NOT CHANGE) ↑↑↑

        const gltf = await load(glb, GLTFLoader, { gltf: { loadBuffers: true, loadImages: true, normalize: true }, image: { type: 'data' } })
        const json = postProcessGLTF(gltf as any)
        return buildFromGLTF(json)
}
