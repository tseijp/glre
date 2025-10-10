import {
        attribute,
        uniform,
        vec4,
        vec3,
        Fn,
        vertexStage,
        instance,
        float,
        Vec3,
        vec2,
        texture,
        clamp,
} from 'glre/src/node'
import { computeCamera } from './camera'
import type { Camera } from './camera'
import type { Atlas, Meshes } from './types'

export const createShader = (camera: Camera, meshes: Meshes, atlas: Atlas) => {
        const MVP = computeCamera(camera, [1280, 800])
        const iMVP = uniform<'mat4'>(MVP, 'MVP')
        const iAtlas = uniform(atlas.src, 'iAtlas')
        const iAtlasSize = uniform(vec2(atlas.W, atlas.H), 'iAtlasSize')
        const iPlaneSize = uniform(vec2(atlas.planeW, atlas.planeH), 'iPlaneSize')
        const iPlaneCols = uniform(float(atlas.cols), 'iPlaneCols')

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
                const L = vec3(0.3, 0.7, 0.5).normalize()
                const diffuse = n.normalize().dot(L).max(0.2)
                const texel = texture(iAtlas, atlasUV(n, local, iPos)).toVar('texel')
                const rgb = texel.rgb.mul(diffuse)
                return vec4(rgb, 0.85)
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
        return { vert, frag, updateCamera, updateAtlas }
}
