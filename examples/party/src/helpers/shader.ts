import { attribute, uniform, vec4, vec3, Fn, vertexStage, instance, float, Vec3, vec2, texture, clamp, If } from 'glre/src/node'
import { computeCamera } from './player/camera'
import type { Camera } from './player/camera'
import type { Atlas, Meshes } from './types'

export const createShader = (camera: Camera, meshes: Meshes, atlas?: Atlas) => {
        const defaultAtlas = atlas || { src: '/texture/world.png', W: 4096, H: 4096, planeW: 1024, planeH: 1024, cols: 4 }
        const MVP = computeCamera(camera, [1280, 800])
        const iMVP = uniform<'mat4'>(MVP, 'MVP')
        const iAtlas = uniform(defaultAtlas.src, 'iAtlas')
        const iAtlasSize = uniform(vec2(defaultAtlas.W, defaultAtlas.H), 'iAtlasSize')
        const iPlaneSize = uniform(vec2(defaultAtlas.planeW, defaultAtlas.planeH), 'iPlaneSize')
        const iPlaneCols = uniform(float(defaultAtlas.cols), 'iPlaneCols')
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

        const vs = Fn(([p, iPos, iScl]: [Vec3, Vec3, Vec3]) => {
                const base = p.mul(iScl).toVar('base')
                return iMVP.mul(vec4(base.add(iPos), 1))
        })

        const fs = Fn(([n, local, iPos]: [Vec3, Vec3, Vec3]) => {
                // return vec4(1, 0, 0, 1)
                const sameFace = n.dot(iFace).equal(1)
                const W = iPos
                        .add(local)
                        .sub(n.sign().mul(float(1e-3)))
                        .floor()
                const isHover = W.x.equal(iHover.x).and(W.y.equal(iHover.y)).and(W.z.equal(iHover.z))
                const L = vec3(0.3, 0.7, 0.5).normalize()
                const diffuse = n.normalize().dot(L).max(0.2)
                const texel = texture(iAtlas, atlasUV(n, local, iPos)).toVar('texel')
                const baseColor = texel.rgb.mul(diffuse)
                const culturalColor = baseColor.toVar('culturalColor')
                If(sameFace.and(isHover), () => {
                        culturalColor.assign(vec3(1, 0.3, 0.3))
                })
                return vec4(culturalColor, 0.85)
        })

        const vert = vs(vertex, pos, scl)
        const frag = fs(vertexStage(normal), vertexStage(vertex.mul(scl)), vertexStage(pos))
        const updateCamera = (size: number[]) => {
                iMVP.value = computeCamera(camera, size)
        }
        const updateAtlas = (atlas: Atlas) => {
                iAtlas.value = atlas.src
                iAtlasSize.value = [atlas.W, atlas.H]
                iPlaneSize.value = [atlas.planeW, atlas.planeH]
                iPlaneCols.value = atlas.cols
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

        return { vert, frag, updateCamera, updateAtlas, updateHover }
}
