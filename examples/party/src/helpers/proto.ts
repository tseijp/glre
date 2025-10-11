// Protocol encoding for real-time communication
export const K = {
        OP: 0, // Voxel operation
        POSE: 1, // Player pose
} as const

export const encOp = (x: number, y: number, z: number): ArrayBuffer => {
        const buf = new ArrayBuffer(16)
        const view = new DataView(buf)
        view.setUint8(0, K.OP)
        view.setFloat32(4, x, true)
        view.setFloat32(8, y, true)
        view.setFloat32(12, z, true)
        return buf
}

export const encPose = (x: number, y: number, z: number, yaw: number, pitch: number): ArrayBuffer => {
        const buf = new ArrayBuffer(24)
        const view = new DataView(buf)
        view.setUint8(0, K.POSE)
        view.setFloat32(4, x, true)
        view.setFloat32(8, y, true)
        view.setFloat32(12, z, true)
        view.setFloat32(16, yaw, true)
        view.setFloat32(20, pitch, true)
        return buf
}

export const dec = (buf: ArrayBuffer) => {
        const view = new DataView(buf)
        const kind = view.getUint8(0)
        
        if (kind === K.OP) {
                return {
                        kind,
                        x: view.getFloat32(4, true),
                        y: view.getFloat32(8, true),
                        z: view.getFloat32(12, true),
                }
        }
        
        if (kind === K.POSE) {
                return {
                        kind,
                        x: view.getFloat32(4, true),
                        y: view.getFloat32(8, true),
                        z: view.getFloat32(12, true),
                        yaw: view.getFloat32(16, true),
                        pitch: view.getFloat32(20, true),
                }
        }
        
        return { kind: -1 }
}