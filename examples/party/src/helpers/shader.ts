import { attribute, uniform, vec4, vec3, Fn, vertexStage, instance, float, Vec3, vec2, texture, clamp, If, int } from 'glre/src/node'
import { computeCamera } from './player/camera'
import type { Camera } from './player/camera'
import type { Atlas, Meshes } from './types'

export const createShader = (camera: Camera, meshes: Meshes, atlas?: Atlas) => {
        const defaultAtlas = atlas || { src: '', W: 4096, H: 4096, planeW: 1024, planeH: 1024, cols: 4 }
        const MVP = computeCamera(camera, [1280, 800])
        const iMVP = uniform<'mat4'>(MVP, 'MVP')
        const iA0 = uniform(defaultAtlas.src || '/texture/world.png', 'iAtlas0')
        const iA1 = uniform(defaultAtlas.src || '/texture/world.png', 'iAtlas1')
        const iA2 = uniform(defaultAtlas.src || '/texture/world.png', 'iAtlas2')
        const iA3 = uniform(defaultAtlas.src || '/texture/world.png', 'iAtlas3')
        const iA4 = uniform(defaultAtlas.src || '/texture/world.png', 'iAtlas4')
        const iA5 = uniform(defaultAtlas.src || '/texture/world.png', 'iAtlas5')
        const iA6 = uniform(defaultAtlas.src || '/texture/world.png', 'iAtlas6')
        const iA7 = uniform(defaultAtlas.src || '/texture/world.png', 'iAtlas7')
        const iAtlasSize = uniform(vec2(defaultAtlas.W, defaultAtlas.H), 'iAtlasSize')
        const iPlaneSize = uniform(vec2(defaultAtlas.planeW, defaultAtlas.planeH), 'iPlaneSize')
        const iPlaneCols = uniform(float(defaultAtlas.cols), 'iPlaneCols')
        const rO0 = uniform(vec3(0), 'iRegionOff0')
        const rO1 = uniform(vec3(0), 'iRegionOff1')
        const rO2 = uniform(vec3(0), 'iRegionOff2')
        const rO3 = uniform(vec3(0), 'iRegionOff3')
        const rO4 = uniform(vec3(0), 'iRegionOff4')
        const rO5 = uniform(vec3(0), 'iRegionOff5')
        const rO6 = uniform(vec3(0), 'iRegionOff6')
        const rO7 = uniform(vec3(0), 'iRegionOff7')
        const iHover = uniform(vec3(-1), 'iHover')
        const iFace = uniform(vec3(-1), 'iFace')

        const atlasUV = Fn(([n, local, iPos]: [Vec3, Vec3, Vec3]) => {
                const half = float(0.5)
                const W = iPos.add(local).sub(n.sign().mul(half)).floor().toVar('W')
                const ci = W.x.div(16).floor()
                const ck = W.y.div(16).floor()
                const cj = W.z.div(16).floor()
                const lx = W.x.mod(16)
                const ly = W.y.mod(16)
                const lz = W.z.mod(16)
                const px = cj.mod(iPlaneCols)
                const py = cj.div(iPlaneCols).floor()
                const zt = vec2(px.mul(iPlaneSize.x), py.mul(iPlaneSize.y))
                const ct = vec2(ci.mul(64), ck.mul(64))
                const lt = vec2(lz.mod(4).mul(16).add(lx), lz.div(4).floor().mul(16).add(ly))
                const uv = zt.add(ct).add(lt).add(vec2(0.5)).div(iAtlasSize)
                const eps = float(0.5).div(iAtlasSize.x.max(iAtlasSize.y))
                return clamp(uv, vec2(eps), vec2(float(1).sub(eps)))
        })

        const vertex = attribute<'vec3'>(meshes.vertex, 'vertex')
        const normal = attribute<'vec3'>(meshes.normal, 'normal')
        const scl = instance<'vec3'>(meshes.scl, 'scl')
        const pos = instance<'vec3'>(meshes.pos, 'pos')
        const aid = instance<'float'>((meshes as any).aid || [0], 'aid')

        const regionOff = Fn(([id]: [any]) => {
                const v = vec3(0, 0, 0).toVar('v')
                If(id.equal(0), () => {
                        v.assign(rO0)
                })
                If(id.equal(1), () => {
                        v.assign(rO1)
                })
                If(id.equal(2), () => {
                        v.assign(rO2)
                })
                If(id.equal(3), () => {
                        v.assign(rO3)
                })
                If(id.equal(4), () => {
                        v.assign(rO4)
                })
                If(id.equal(5), () => {
                        v.assign(rO5)
                })
                If(id.equal(6), () => {
                        v.assign(rO6)
                })
                If(id.equal(7), () => {
                        v.assign(rO7)
                })
                return v
        })

        const sampleAtlas = Fn(([id, uv]: [any, any]) => {
                const t = texture(iA0, uv).toVar('t')
                If(id.equal(1), () => {
                        t.assign(texture(iA1, uv))
                })
                If(id.equal(2), () => {
                        t.assign(texture(iA2, uv))
                })
                If(id.equal(3), () => {
                        t.assign(texture(iA3, uv))
                })
                If(id.equal(4), () => {
                        t.assign(texture(iA4, uv))
                })
                If(id.equal(5), () => {
                        t.assign(texture(iA5, uv))
                })
                If(id.equal(6), () => {
                        t.assign(texture(iA6, uv))
                })
                If(id.equal(7), () => {
                        t.assign(texture(iA7, uv))
                })
                return t
        })

        const vs = Fn(([p, iPos, iScl, iAid]: [Vec3, Vec3, Vec3, any]) => {
                const base = p.mul(iScl).toVar('base')
                const off = regionOff(iAid)
                return iMVP.mul(vec4(base.add(iPos).add(off), 1))
        })

        const fs = Fn(([n, local, iPos, iAid]: [Vec3, Vec3, Vec3, any]) => {
                // return vec4(1, 0, 0, 1)
                const sameFace = n.dot(iFace).equal(1)
                const W = iPos
                        .add(local)
                        .sub(n.sign().mul(float(1e-3)))
                        .floor()
                const isHover = W.x.equal(iHover.x).and(W.y.equal(iHover.y)).and(W.z.equal(iHover.z))
                const L = vec3(0.3, 0.7, 0.5).normalize()
                const diffuse = n.normalize().dot(L).max(0.2)
                const texel = sampleAtlas(iAid, atlasUV(n, local, iPos)).toVar('texel')
                const baseColor = texel.rgb.mul(diffuse)
                const culturalColor = baseColor.toVar('culturalColor')
                If(sameFace.and(isHover), () => {
                        culturalColor.assign(vec3(1, 0.3, 0.3))
                })
                return vec4(culturalColor, 0.85)
        })

        const vert = vs(vertex, pos, scl, aid)
        const frag = fs(vertexStage(normal), vertexStage(vertex.mul(scl)), vertexStage(pos), vertexStage(aid))
        const updateCamera = (size: number[]) => {
                iMVP.value = computeCamera(camera, size)
        }
        const updateAtlas = (atlas: Atlas) => updateAtlases([atlas], [[0, 0, 0]])
        const updateAtlases = (atlases: Atlas[], offs: number[][]) => {
                const A = (i: number) => atlases[i] || defaultAtlas
                const O = (i: number) => offs[i] || [0, 0, 0]
                iA0.value = A(0).src
                iA1.value = A(1).src
                iA2.value = A(2).src
                iA3.value = A(3).src
                iA4.value = A(4).src
                iA5.value = A(5).src
                iA6.value = A(6).src
                iA7.value = A(7).src
                iAtlasSize.value = [A(0).W, A(0).H]
                iPlaneSize.value = [A(0).planeW, A(0).planeH]
                iPlaneCols.value = A(0).cols
                rO0.value = O(0) as any
                rO1.value = O(1) as any
                rO2.value = O(2) as any
                rO3.value = O(3) as any
                rO4.value = O(4) as any
                rO5.value = O(5) as any
                rO6.value = O(6) as any
                rO7.value = O(7) as any
        }

        const updateHover = (hit?: any, near?: number[]) => {
                if (!hit || !near) {
                        iHover.value = [-1, -1, -1]
                        iFace.value = [-1, -1, -1]
                        return
                }
                const f = hit.face
                const eps = 1e-3
                const x = Math.floor(near[0] - eps * f[0])
                const y = Math.floor(near[1] - eps * f[1])
                const z = Math.floor(near[2] - eps * f[2])
                iHover.value = [x, y, z]
                iFace.value = f
        }

        return { vert, frag, updateCamera, updateAtlas, updateAtlases, updateHover }
}
