import { load } from '@loaders.gl/core'
import { GLTFLoader, postProcessGLTF } from '@loaders.gl/gltf'
import { ext } from './b3dm'
import { buildFromGLTF } from './gltf'

export const loadCesiumTiles = async (assetId: number) => {
        const tsRes = await fetch(`/api/v1/cesium/${assetId}/tileset`)
        if (!tsRes.ok) throw new Error(`Error: /api/v1/cesium/${assetId}/tileset res is not ok`)
        const tileset: any = await tsRes.json()
        const root = tileset?.root || {}
        const c = root.content || (root.contents && root.contents[0]) || {}
        const uri = c.uri || c.url || ''
        if (!uri) throw new Error(`Error: uri not exist`)
        const raw = await fetch(`/api/v1/cesium/${assetId}/content?src=${encodeURIComponent(uri)}`).then((r) => r.arrayBuffer())
        const isB3dm = uri.endsWith('.b3dm') || uri.endsWith('.B3DM')
        const glb = isB3dm ? ext(raw) : raw
        console.log('HIHI')
        // ↓↓↓ (DO NOT CHANGE) ↓↓↓
        console.log({ tileset, root, c, uri, raw, isB3dm, glb })
        // ↑↑ (DO NOT CHANGE) ↑↑↑
        const gltf = await load(glb, GLTFLoader, { gltf: { loadBuffers: true, loadImages: true, normalize: true }, image: { type: 'data' } })
        const json = postProcessGLTF(gltf as any)
        return buildFromGLTF(json)
}
