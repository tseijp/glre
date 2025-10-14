export type Meshes = {
        // attributes
        vertex: number[]
        normal: number[]
        count: number
        // instance attribute
        pos: number[]
        scl: number[]
        cnt: number
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

export type Chunk = {
        i: number
        j: number
        k: number
        x: number
        y: number
        z: number
        vox: Uint8Array
        pos: number[]
        scl: number[]
        cnt: number
        gen?: boolean
        dirty?: boolean
        visible?: boolean
}

export type Chunks = Map<number, Chunk>

export type Region = {
        i: number
        j: number
        k: number
        x: number
        y: number
        z: number
        lat: number
        lng: number
        zoom: number
        atlas: Atlas
        mesh: Meshes
        chunks: Chunks
        visible?: boolean
}

// @TODO REMOVE
export type Dims = { size: [number, number, number]; center: [number, number, number] }
