import { Meshes } from '../types'

const createVertexData = () => {
        const p = 0.5
        const n = -0.5
        // prettier-ignore
        return [
                n, n, n,  n, n, p,  n, p, p,  n, p, p,  n, p, n,  n, n, n,
                p, n, p,  p, n, n,  p, p, n,  p, p, n,  p, p, p,  p, n, p,
                n, n, n,  p, n, n,  p, n, p,  p, n, p,  n, n, p,  n, n, n,
                n, p, p,  p, p, p,  p, p, n,  p, p, n,  n, p, n,  n, p, p,
                p, n, n,  n, n, n,  n, p, n,  n, p, n,  p, p, n,  p, n, n,
                n, n, p,  p, n, p,  p, p, p,  p, p, p,  n, p, p,  n, n, p,
        ]
}

const createNormalData = () => {
        const normals: number[] = []
        const data = [
                [-1, 0, 0],
                [1, 0, 0],
                [0, -1, 0],
                [0, 1, 0],
                [0, 0, -1],
                [0, 0, 1],
        ]
        for (let j = 0; j < 6; j++) for (let i = 0; i < 6; i++) normals.push(data[j][0], data[j][1], data[j][2])
        return normals
}

// cache
let _vertex: number[]
let _normal: number[]

export const createMeshes = (_camera: any, mesh?: Meshes) => {
        const vertex = (_vertex = _vertex ?? createVertexData())
        const normal = (_normal = _normal ?? createNormalData())
        const pos = mesh?.pos || [0, 0, 0]
        const scl = mesh?.scl || [16, 16, 16]
        const count = vertex.length / 3
        const instanceCount = mesh?.cnt || 1

        const update = (gl: any, xyz?: [number, number, number]) => {
                if (xyz) {
                        pos.push(...xyz)
                        scl.push(1, 1, 1)
                        applyInstances(gl, { pos, scl, cnt: pos.length / 3, vertex, normal })
                }
        }
        const applyChunks = (gl: any, m: Meshes) => {
                pos.length = 0
                scl.length = 0
                pos.push(...m.pos)
                scl.push(...m.scl)
                applyInstances(gl, { pos, scl, cnt: m.cnt, vertex, normal })
        }

        return {
                vertex,
                normal,
                pos,
                scl,
                count,
                instanceCount,
                update,
                applyChunks,
                get cnt() {
                        return instanceCount
                },
        }
}

export const applyInstances = (gl: any, mesh: Meshes) => {
        const c = gl.webgl.context as WebGL2RenderingContext
        const pg = gl.webgl.program as WebGLProgram
        const push = (key: string, data: number[]) => {
                const array = new Float32Array(data)
                const buffer = c.createBuffer()!
                const loc = c.getAttribLocation(pg, key)
                c.bindBuffer(c.ARRAY_BUFFER, buffer)
                c.bufferData(c.ARRAY_BUFFER, array, c.STATIC_DRAW)
                c.enableVertexAttribArray(loc)
                c.vertexAttribPointer(loc, 3, c.FLOAT, false, 0, 0)
                c.vertexAttribDivisor(loc, 1)
        }
        push('scl', mesh.scl)
        push('pos', mesh.pos)
        gl.instanceCount = mesh.cnt
}
