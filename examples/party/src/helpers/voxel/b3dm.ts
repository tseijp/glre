export const ext = (buf: ArrayBuffer) => {
        const dv = new DataView(buf)
        const magic = String.fromCharCode(dv.getUint8(0)) + String.fromCharCode(dv.getUint8(1)) + String.fromCharCode(dv.getUint8(2)) + String.fromCharCode(dv.getUint8(3))
        if (magic !== 'b3dm') return buf
        const pad8 = (n: number) => (n + 7) & ~7
        const fj = dv.getUint32(12, true)
        const fb = dv.getUint32(16, true)
        const bj = dv.getUint32(20, true)
        const bb = dv.getUint32(24, true)
        const off = 28 + pad8(fj) + pad8(fb) + pad8(bj) + pad8(bb)
        const isGLB = (o = 0) => dv.getUint8(o) === 0x67 && dv.getUint8(o + 1) === 0x6c && dv.getUint8(o + 2) === 0x54 && dv.getUint8(o + 3) === 0x46
        if (isGLB(off)) return buf.slice(off)
        if (isGLB(0)) return buf
        const u8 = new Uint8Array(buf)
        for (let i = 0; i + 3 < u8.length; i++) if (u8[i] === 0x67 && u8[i + 1] === 0x6c && u8[i + 2] === 0x54 && u8[i + 3] === 0x46) return buf.slice(i)
        return buf
}
