export const ext = (buf: ArrayBuffer) => {
        // const dv = new DataView(buf)
        // const magic = String.fromCharCode(dv.getUint8(0)) + String.fromCharCode(dv.getUint8(1)) + String.fromCharCode(dv.getUint8(2)) + String.fromCharCode(dv.getUint8(3))
        // if (magic !== 'b3dm') return buf
        // const pad8 = (n:number) => (n + 7) & ~7
        // const featureJson = dv.getUint32(12, true)
        // const featureBin  = dv.getUint32(16, true)
        // const batchJson   = dv.getUint32(20, true)
        // const batchBin    = dv.getUint32(24, true)
        // const start = 28 + pad8(featureJson) + pad8(featureBin) + pad8(batchJson) + pad8(batchBin)
        // return buf.slice(start)
        const dv = new DataView(buf)
        const magic = String.fromCharCode(dv.getUint8(0)) + String.fromCharCode(dv.getUint8(1)) + String.fromCharCode(dv.getUint8(2)) + String.fromCharCode(dv.getUint8(3))
        if (magic !== 'b3dm') return buf
        const v = dv.getUint32(4, true)
        const featureJson = dv.getUint32(12, true)
        const featureBin = dv.getUint32(16, true)
        const batchJson = dv.getUint32(20, true)
        const batchBin = dv.getUint32(24, true)
        const header = v >= 1 ? 28 : 28
        const start = header + featureJson + featureBin + batchJson + batchBin
        return buf.slice(start)
}
