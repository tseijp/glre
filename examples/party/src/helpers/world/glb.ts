export type V4 = [number, number, number, number]
export type V3 = [number, number, number]
export type V2 = [number, number]
export type Tex = { w: number; h: number; dat: Uint8Array }
export type Mat = { base: V4; tex?: number }
export type Tri = {
        v0: V3
        v1: V3
        v2: V3
        uv0: V2
        uv1: V2
        uv2: V2
        mat: number
}

export type Parsed = {
        tris: Tri[]
        materials: Mat[]
        textures: Tex[]
        aabb: { min: V3; max: V3 }
        model: { extent: V3; center: V3 }
}

const toRGBA = (img: any): Tex | undefined => {
        if (!img) return
        if (img.data && img.width && img.height) {
                const w = img.width | 0
                const h = img.height | 0
                const comp = (img.components || 4) | 0
                const src: Uint8Array = img.data
                if (comp === 4) return { w, h, dat: src }
                if (comp === 3) {
                        const dst = new Uint8Array(w * h * 4)
                        let si = 0
                        let di = 0
                        for (let i = 0; i < w * h; i++) {
                                dst[di++] = src[si++]
                                dst[di++] = src[si++]
                                dst[di++] = src[si++]
                                dst[di++] = 255
                        }
                        return { w, h, dat: dst }
                }
        }
        if (typeof document !== 'undefined' && img && img.width && img.height) {
                const canvas = document.createElement('canvas')
                const ctx = canvas.getContext('2d')
                if (!ctx) return
                canvas.width = img.width
                canvas.height = img.height
                ctx.drawImage(img, 0, 0)
                const id = ctx.getImageData(0, 0, canvas.width, canvas.height)
                return { w: id.width, h: id.height, dat: new Uint8Array(id.data.buffer.slice(0)) }
        }
        return
}

export const parseGLB = async (buf: ArrayBuffer): Promise<Parsed> => {
        try {
                const { load } = await import('@loaders.gl/core')
                const { GLTFLoader, postProcessGLTF } = await import('@loaders.gl/gltf')
                const gltf = await load(buf, GLTFLoader, {
                        gltf: { loadBuffers: true, loadImages: true, normalize: true, decompressMeshes: true },
                        image: { type: 'data' },
                })
                if (!gltf) return { tris: [], materials: [], textures: [], aabb: { min: [0, 0, 0], max: [32, 16, 32] }, model: { extent: [32, 16, 32], center: [16, 8, 16] } }
                const json = postProcessGLTF(gltf)
                if (!json || !json.meshes || json.meshes.length === 0) return { tris: [], materials: [], textures: [], aabb: { min: [0, 0, 0], max: [32, 16, 32] }, model: { extent: [32, 16, 32], center: [16, 8, 16] } }
                const textures: Tex[] = []
                const imageIndexMap = new Map<any, number>()
                const imgs = json.images || []
                for (let i = 0; i < imgs.length; i++) {
                        const tex = toRGBA(imgs[i]?.image)
                        if (tex) {
                                imageIndexMap.set(imgs[i], textures.length)
                                textures.push(tex)
                        } else imageIndexMap.set(imgs[i], -1)
                }
                const materials: Mat[] = (json.materials || []).map((m) => {
                        const p = m.pbrMetallicRoughness || ({} as any)
                        const base = (p.baseColorFactor || [1, 1, 1, 1]) as number[]
                        let tex: number | undefined
                        const bct = p.baseColorTexture
                        if (bct && bct.texture && bct.texture.source) {
                                const idx = imageIndexMap.get(bct.texture.source)
                                tex = typeof idx === 'number' && idx >= 0 ? idx : undefined
                        }
                        return { base: [base[0], base[1], base[2], base[3]], tex }
                })
                const tris: Tri[] = []
                let min: V3 = [Infinity, Infinity, Infinity]
                let max: V3 = [-Infinity, -Infinity, -Infinity]
                for (const mesh of json.meshes || []) {
                        for (const prim of mesh.primitives || []) {
                                const posAcc = prim.attributes?.POSITION
                                if (!posAcc) continue
                                const pos = posAcc.value as Float32Array
                                const uvAcc = prim.attributes?.TEXCOORD_0
                                const uv = uvAcc ? (uvAcc.value as Float32Array) : new Float32Array(0)
                                const indAcc = prim.indices
                                const indices = indAcc ? indAcc.value : null
                                const mat = prim.material ? (json.materials || []).indexOf(prim.material) : 0
                                const pushTri = (i0: number, i1: number, i2: number) => {
                                        const v0: V3 = [pos[i0 * 3], pos[i0 * 3 + 1], pos[i0 * 3 + 2]]
                                        const v1: V3 = [pos[i1 * 3], pos[i1 * 3 + 1], pos[i1 * 3 + 2]]
                                        const v2: V3 = [pos[i2 * 3], pos[i2 * 3 + 1], pos[i2 * 3 + 2]]
                                        min = [Math.min(min[0], v0[0], v1[0], v2[0]), Math.min(min[1], v0[1], v1[1], v2[1]), Math.min(min[2], v0[2], v1[2], v2[2])]
                                        max = [Math.max(max[0], v0[0], v1[0], v2[0]), Math.max(max[1], v0[1], v1[1], v2[1]), Math.max(max[2], v0[2], v1[2], v2[2])]
                                        const uv0: V2 = [0, 0]
                                        const uv1: V2 = [0, 0]
                                        const uv2: V2 = [0, 0]
                                        if (uv.length > 0) {
                                                uv0[0] = uv[i0 * 2]
                                                uv0[1] = 1 - uv[i0 * 2 + 1]
                                                uv1[0] = uv[i1 * 2]
                                                uv1[1] = 1 - uv[i1 * 2 + 1]
                                                uv2[0] = uv[i2 * 2]
                                                uv2[1] = 1 - uv[i2 * 2 + 1]
                                        }
                                        tris.push({ v0, v1, v2, uv0, uv1, uv2, mat })
                                }
                                if (indices) {
                                        for (let t = 0; t < indices.length; t += 3) {
                                                const i0 = indices[t + 0] as number
                                                const i1 = indices[t + 1] as number
                                                const i2 = indices[t + 2] as number
                                                pushTri(i0, i1, i2)
                                        }
                                } else {
                                        for (let i = 0; i < pos.length / 3; i += 3) pushTri(i + 0, i + 1, i + 2)
                                }
                        }
                }
                const width = max[0] - min[0] || 0
                const depth = max[1] - min[1] || 0
                const height = max[2] - min[2] || 0
                const center: V3 = [min[0] + width * 0.5, min[1] + depth * 0.5, min[2] + height * 0.5]
                const extent: V3 = [width, depth, height]
                return { tris, materials, textures, aabb: { min, max }, model: { extent, center } }
        } catch (error) {
                return { tris: [], materials: [], textures: [], aabb: { min: [0, 0, 0], max: [32, 16, 32] }, model: { extent: [32, 16, 32], center: [16, 8, 16] } }
        }
}
