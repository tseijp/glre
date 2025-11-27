export type Meshes = {
        pos: number[]
        scl: number[]
        cnt: number
        vertex: number[]
        normal: number[]
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
