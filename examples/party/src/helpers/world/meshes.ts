import type { Meshes, Region } from '../types'
import { gather } from './chunk'

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
                        if (region.chunks) {
                                const mesh = gather(region.chunks)
                                for (let i = 0; i < mesh.pos.length; i++) pos.push(mesh.pos[i])
                                for (let i = 0; i < mesh.scl.length; i++) scl.push(mesh.scl[i])
                                for (let i = 0; i < mesh.cnt; i++) aid.push(r)
                                cnt += mesh.cnt
                        }
                        pos.push(region.x + 128, 1.5, region.z + 128)
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
        const bufs = ((mesh as any)._bufs = (mesh as any)._bufs || {})
        const bind3 = (key: string, data: number[]) => {
                const loc = c.getAttribLocation(pg, key)
                const array = new Float32Array(data)
                const buf = (bufs[key] = bufs[key] || c.createBuffer())
                c.bindBuffer(c.ARRAY_BUFFER, buf)
                if (!bufs[key + ':init']) {
                        c.bufferData(c.ARRAY_BUFFER, array, c.DYNAMIC_DRAW)
                        c.enableVertexAttribArray(loc)
                        c.vertexAttribPointer(loc, 3, c.FLOAT, false, 0, 0)
                        c.vertexAttribDivisor(loc, 1)
                        bufs[key + ':init'] = 1
                        bufs[key + ':len'] = array.length
                        return
                }
                if (bufs[key + ':len'] !== array.length) {
                        c.bufferData(c.ARRAY_BUFFER, array, c.DYNAMIC_DRAW)
                        bufs[key + ':len'] = array.length
                        return
                }
                c.bufferSubData(c.ARRAY_BUFFER, 0, array)
        }
        const bind1 = (key: string, data: number[]) => {
                const loc = c.getAttribLocation(pg, key)
                const array = new Float32Array(data)
                const buf = (bufs[key] = bufs[key] || c.createBuffer())
                c.bindBuffer(c.ARRAY_BUFFER, buf)
                if (!bufs[key + ':init']) {
                        c.bufferData(c.ARRAY_BUFFER, array, c.DYNAMIC_DRAW)
                        c.enableVertexAttribArray(loc)
                        c.vertexAttribPointer(loc, 1, c.FLOAT, false, 0, 0)
                        c.vertexAttribDivisor(loc, 1)
                        bufs[key + ':init'] = 1
                        bufs[key + ':len'] = array.length
                        return
                }
                if (bufs[key + ':len'] !== array.length) {
                        c.bufferData(c.ARRAY_BUFFER, array, c.DYNAMIC_DRAW)
                        bufs[key + ':len'] = array.length
                        return
                }
                c.bufferSubData(c.ARRAY_BUFFER, 0, array)
        }
        bind3('scl', mesh.scl)
        bind3('pos', mesh.pos)
        if ((mesh as any).aid?.length) bind1('aid', (mesh as any).aid as number[])
        gl.instanceCount = mesh.cnt
}
