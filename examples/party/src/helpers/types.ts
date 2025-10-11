export type Meshes = {
        pos: number[]
        scl: number[]
        cnt: number
        vertex: number[]
        normal: number[]
        // runtime fields/methods provided by createMeshes
        count?: number
        instanceCount?: number
        update?: (gl: any, xyz?: [number, number, number]) => void
        applyChunks?: (gl: any, m: Meshes) => void
}

export type Atlas = {
        src: string
        W: number
        H: number
        planeW: number
        planeH: number
        cols: number
}

export type FileData = { key: string; data: Uint8Array; raw?: Uint8Array; tag?: string }

export type Built = { atlas: Atlas; mesh: Meshes }

export type Dims = { size: [number, number, number]; center: [number, number, number] }

export type BuiltState = { file: FileData | string; dims: Dims }
