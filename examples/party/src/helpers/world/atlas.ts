export const encodeImagePNG = async (pix: Uint8Array, w: number, h: number) => {
        const canvas: any = typeof OffscreenCanvas !== 'undefined' ? new OffscreenCanvas(w, h) : document.createElement('canvas')
        canvas.width = w
        canvas.height = h
        const ctx: any = canvas.getContext('2d', { willReadFrequently: true })
        const img = new ImageData(new Uint8ClampedArray(pix.buffer, pix.byteOffset, w * h * 4) as any, w, h)
        ctx.putImageData(img, 0, 0)
        const blob: Blob = canvas.convertToBlob ? await canvas.convertToBlob({ type: 'image/png' }) : await new Promise((res) => (canvas as HTMLCanvasElement).toBlob((b) => res(b as Blob), 'image/png'))
        return new Uint8Array(await blob.arrayBuffer())
}

export const blitChunk64ToWorld = (src: Uint8Array, ci = 0, cj = 0, ck = 0, dst?: Uint8Array) => {
        const world = dst
        if (!world) return
        const planeX = cj & 3
        const planeY = cj >> 2
        const ox = planeX * 1024 + ci * 64
        const oy = planeY * 1024 + ck * 64
        for (let y = 0; y < 64; y++) {
                const dy = oy + y
                const di = (dy * 4096 + ox) * 4
                const si = y * 64 * 4
                world.set(src.subarray(si, si + 64 * 4), di)
        }
}

const extractChunksFromWorldPNG = async (buf: ArrayBuffer) => {
        const raw = new Uint8Array(buf)
        const isRGBA = raw.byteLength === 4096 * 4096 * 4
        let data: Uint8Array = raw
        if (!isRGBA)
                data = await (async () => {
                        const blob = new Blob([buf], { type: 'image/png' })
                        const bmp: any = (globalThis as any).createImageBitmap
                                ? await createImageBitmap(blob)
                                : await new Promise((res) => {
                                          const img = new Image()
                                          img.onload = () => res(img)
                                          img.src = URL.createObjectURL(blob)
                                  })
                        const w = bmp.width || 4096
                        const h = bmp.height || 4096
                        const canvas: any = typeof OffscreenCanvas !== 'undefined' ? new OffscreenCanvas(w, h) : document.createElement('canvas')
                        canvas.width = w
                        canvas.height = h
                        const ctx: any = canvas.getContext('2d', { willReadFrequently: true })
                        ctx.drawImage(bmp, 0, 0)
                        const { data } = ctx.getImageData(0, 0, w, h)
                        return new Uint8Array(data.buffer.slice(0))
                })()
        const out = new Map<string, Uint8Array>()
        for (let k = 0; k < 16; k++)
                for (let j = 0; j < 16; j++)
                        for (let i = 0; i < 16; i++) {
                                const dst = new Uint8Array(64 * 64 * 4)
                                const planeX = k & 3
                                const planeY = k >> 2
                                const ox = planeX * 1024 + i * 64
                                const oy = planeY * 1024 + j * 64
                                for (let y = 0; y < 64; y++) {
                                        const sy = oy + y
                                        const si = (sy * 4096 + ox) * 4
                                        const di = y * 64 * 4
                                        dst.set(data.subarray(si, si + 64 * 4), di)
                                }
                                out.set(i + '.' + j + '.' + k, dst)
                        }
        return out
}

const splitChunk64ToVoxRGBA = (png64: Uint8Array) => {
        const dst = new Uint8Array(16 * 16 * 16 * 4)
        const get = (x = 0, y = 0) => ((y * 64 + x) * 4) | 0
        const put = (x = 0, y = 0, z = 0) => (((z * 16 + y) * 16 + x) * 4) | 0
        for (let z = 0; z < 16; z++)
                for (let y = 0; y < 16; y++)
                        for (let x = 0; x < 16; x++) {
                                const ox = (z & 3) * 16
                                const oy = (z >> 2) * 16
                                const si = get(ox + x, oy + y)
                                const di = put(x, y, z)
                                dst[di] = png64[si]
                                dst[di + 1] = png64[si + 1]
                                dst[di + 2] = png64[si + 2]
                                dst[di + 3] = png64[si + 3]
                        }
        return dst
}

export const extractVoxelArraysFromWorldPNG = async (buf: ArrayBuffer) => {
        const pngs = await extractChunksFromWorldPNG(buf)
        const out = new Map<string, Uint8Array>()
        for (const [k, v] of pngs) out.set(k, splitChunk64ToVoxRGBA(v))
        return out
}

let chunks = new Map<string, Uint8Array>()

export const FLOOR_MAX_Y = 4

export const initAtlasWorld = async (url: string) => {
        const ab = await fetch(url).then((r) => r.arrayBuffer())
        const rgba = await extractVoxelArraysFromWorldPNG(ab)
        const to01 = (data: Uint8Array, jChunk: number) => {
                const out = new Uint8Array(16 * 16 * 16)
                for (let i = 0, v = 0; i < out.length; i++, v += 4) out[i] = data[v + 3] > 0 ? 1 : 0
                if (jChunk === 0)
                        for (let z = 0; z < 16; z++)
                                for (let y = 0; y <= FLOOR_MAX_Y && y < 16; y++)
                                        for (let x = 0; x < 16; x++) {
                                                out[x + (y + z * 16) * 16] = 1
                                        }
                return out
        }
        for (const [k, v] of rgba) {
                const parts = k.split('.')
                const j = parseInt(parts[1] || '0') | 0
                chunks.set(k, to01(v, j))
        }
}
