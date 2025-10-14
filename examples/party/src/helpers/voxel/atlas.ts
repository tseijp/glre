import { encode, load } from '@loaders.gl/core'
import { ImageLoader, ImageWriter } from '@loaders.gl/images'
import { eachChunk } from '../utils'

export const encodePng = async (pix: Uint8Array, w: number, h: number) => {
        const data = new Uint8ClampedArray(pix.buffer, pix.byteOffset, w * h * 4)
        const ab = await encode({ data, width: w, height: h }, ImageWriter, { image: { mimeType: 'image/png' } as any })
        return new Uint8Array(ab as ArrayBuffer)
}

export const stitchAtlas = (items: any, dst = new Uint8Array(4096 * 4096 * 4)) => {
        const write = (ci = 0, cj = 0, ck = 0, src: Uint8Array) => {
                const planeX = cj & 3
                const planeY = cj >> 2
                const ox = planeX * 1024 + ci * 64
                const oy = planeY * 1024 + ck * 64
                for (let y = 0; y < 64; y++) {
                        const dy = oy + y
                        const di = (dy * 4096 + ox) * 4
                        const si = y * 64 * 4
                        dst.set(src.subarray(si, si + 64 * 4), di)
                }
        }
        for (const it of items) {
                const [ci, cj, ck] = it.key.split('.').map((v: string) => parseInt(v) | 0)
                write(ci, cj, ck, it.rgba)
        }
        return dst
}

export const readAtlasChunks = async (buf: ArrayBuffer) => {
        const img = (await load(buf, ImageLoader, { image: { type: 'data' } })) as any
        const dat = img.data instanceof Uint8ClampedArray ? new Uint8Array(img.data.buffer.slice(0)) : img.data
        const out = new Map<string, Uint8Array>()
        eachChunk((i, j, k) => {
                const dst = new Uint8Array(64 * 64 * 4)
                const planeX = k & 3
                const planeY = k >> 2
                const ox = planeX * 1024 + i * 64
                const oy = planeY * 1024 + j * 64
                for (let y = 0; y < 64; y++) {
                        const sy = oy + y
                        const si = (sy * 4096 + ox) * 4
                        const di = y * 64 * 4
                        dst.set(dat.subarray(si, si + 64 * 4), di)
                }
                out.set(i + '.' + j + '.' + k, dst)
        })
        return out
}

export const tileToVox = (png64: Uint8Array) => {
        const dst = new Uint8Array(16 * 16 * 16 * 4)
        const get = (x = 0, y = 0) => ((y * 64 + x) * 4) | 0
        const put = (x = 0, y = 0, z = 0) => (((z * 16 + y) * 16 + x) * 4) | 0
        const write = (x = 0, y = 0, z = 0) => {
                const ox = (z & 3) * 16
                const oy = (z >> 2) * 16
                const si = get(ox + x, oy + y)
                const di = put(x, y, z)
                dst[di] = png64[si]
                dst[di + 1] = png64[si + 1]
                dst[di + 2] = png64[si + 2]
                dst[di + 3] = png64[si + 3]
        }
        for (let z = 0; z < 16; z++) for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) write(x, y, z)
        return dst
}

export const atlasToVox = async (buf: ArrayBuffer) => {
        const pngs = await readAtlasChunks(buf)
        const out = new Map<string, Uint8Array>()
        for (const [k, v] of pngs) out.set(k, tileToVox(v))
        return out
}

export const normalizeVox = (vox: any[]) => {
        const ret = new Map<string, Uint8Array>()
        for (const it of vox) ret.set(it.key, tileToVox(it.rgba))
        return ret
}
