import type { Meshes, Region } from '../types'

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
        // attributes
        const vertex = (_vertex = _vertex ?? createVertexData())
        const normal = (_normal = _normal ?? createNormalData())
        const count = 36 // vertex.length / 3
        // instance attributes
        const pos = mesh?.pos || [0, 0, 0]
        const scl = mesh?.scl || [16, 16, 16]
        const aid: number[] = [0]
        let cnt = mesh?.cnt || 1

        const applyRegions = (regions: Region[]) => {
                pos.length = 0
                scl.length = 0
                aid.length = 0
                cnt = 0
                for (let r = 0; r < regions.length; r++) {
                        const region = regions[r]
                        if (!region) continue
                        if (!region.visible) continue
                        if (region.mesh?.cnt) {
                                pos.push(...region.mesh.pos)
                                scl.push(...region.mesh.scl)
                                for (let i = 0; i < region.mesh.cnt; i++) aid.push(r)
                                cnt += region.mesh.cnt
                        }
                        pos.push(region.x + 128, region.y + 1.5, region.z + 128)
                        scl.push(256, 3, 256)
                        aid.push(r)
                        cnt++
                }
        }

        return {
                vertex,
                normal,
                pos,
                scl,
                aid,
                count,
                applyRegions,
                get cnt() {
                        return cnt
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
        const push1 = (key: string, data: number[]) => {
                const array = new Float32Array(data)
                const buffer = c.createBuffer()!
                const loc = c.getAttribLocation(pg, key)
                c.bindBuffer(c.ARRAY_BUFFER, buffer)
                c.bufferData(c.ARRAY_BUFFER, array, c.STATIC_DRAW)
                c.enableVertexAttribArray(loc)
                c.vertexAttribPointer(loc, 1, c.FLOAT, false, 0, 0)
                c.vertexAttribDivisor(loc, 1)
        }
        push('scl', mesh.scl)
        push('pos', mesh.pos)
        if ((mesh as any).aid?.length) push1('aid', (mesh as any).aid as number[])
        gl.instanceCount = mesh.cnt
}
