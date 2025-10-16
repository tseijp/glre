import { attribute, uniform, vec4, vec3, Fn, vertexStage, instance, float, Vec3, vec2, texture, clamp, If, int } from 'glre/src/node'
import { computeCamera } from './player/camera'
import type { Camera } from './player/camera'
import type { Atlas, Meshes } from './types'

export const createShader = (camera: Camera, meshes: Meshes, atlas?: Atlas) => {
        const defaultAtlas = atlas || { src: '', W: 4096, H: 4096, planeW: 1024, planeH: 1024, cols: 4 }
        const MVP = computeCamera(camera, [1280, 800])
        const iMVP = uniform<'mat4'>(MVP, 'MVP')
        const NIL = '/texture/world.png'
        const iA0 = uniform(defaultAtlas.src || NIL, 'iAtlas0')
        const iA1 = uniform(defaultAtlas.src || NIL, 'iAtlas1')
        const iA2 = uniform(defaultAtlas.src || NIL, 'iAtlas2')
        const iA3 = uniform(defaultAtlas.src || NIL, 'iAtlas3')
        const iA4 = uniform(defaultAtlas.src || NIL, 'iAtlas4')
        const iA5 = uniform(defaultAtlas.src || NIL, 'iAtlas5')
        const iA6 = uniform(defaultAtlas.src || NIL, 'iAtlas6')
        const iA7 = uniform(defaultAtlas.src || NIL, 'iAtlas7')
        const iAtlasSize = uniform(vec2(defaultAtlas.W, defaultAtlas.H), 'iAtlasSize')
        const iPlaneSize = uniform(vec2(defaultAtlas.planeW, defaultAtlas.planeH), 'iPlaneSize')
        const iPlaneCols = uniform(float(defaultAtlas.cols), 'iPlaneCols')
        const rM0 = uniform<'mat4'>([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1] as any, 'iRegionModel0')
        const rM1 = uniform<'mat4'>([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1] as any, 'iRegionModel1')
        const rM2 = uniform<'mat4'>([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1] as any, 'iRegionModel2')
        const rM3 = uniform<'mat4'>([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1] as any, 'iRegionModel3')
        const rM4 = uniform<'mat4'>([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1] as any, 'iRegionModel4')
        const rM5 = uniform<'mat4'>([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1] as any, 'iRegionModel5')
        const rM6 = uniform<'mat4'>([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1] as any, 'iRegionModel6')
        const rM7 = uniform<'mat4'>([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1] as any, 'iRegionModel7')
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

        const regionModel = Fn(([id]: [any]) => {
                const mv = iMVP.toVar('RM')
                If(id.equal(0), () => {
                        mv.assign(rM0)
                })
                If(id.equal(1), () => {
                        mv.assign(rM1)
                })
                If(id.equal(2), () => {
                        mv.assign(rM2)
                })
                If(id.equal(3), () => {
                        mv.assign(rM3)
                })
                If(id.equal(4), () => {
                        mv.assign(rM4)
                })
                If(id.equal(5), () => {
                        mv.assign(rM5)
                })
                If(id.equal(6), () => {
                        mv.assign(rM6)
                })
                If(id.equal(7), () => {
                        mv.assign(rM7)
                })
                return mv
        })

        const sampleAtlas = Fn(([id, uv]: [any, any]) => {
                const t = vec4(0, 0, 0, 1).toVar('t')
                If(id.equal(0), () => {
                        t.assign(texture(iA0, uv))
                })
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
                const base = p.mul(iScl)
                const local = vec4(base.add(iPos), 1)
                const RM = regionModel(iAid)
                return iMVP.mul(RM.mul(local))
        })

        const fs = Fn(([n, local, iPos, iAid]: [Vec3, Vec3, Vec3, any]) => {
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
                const A = (i: number) => atlases[i]
                const setTex = (slot: number, src?: string) => {
                        if (!src) return
                        if (slot === 0) iA0.value = src
                        if (slot === 1) iA1.value = src
                        if (slot === 2) iA2.value = src
                        if (slot === 3) iA3.value = src
                        if (slot === 4) iA4.value = src
                        if (slot === 5) iA5.value = src
                        if (slot === 6) iA6.value = src
                        if (slot === 7) iA7.value = src
                }
                for (let i = 0; i < 8; i++) setTex(i, A(i)?.src)
                const a0 = atlases[0] || defaultAtlas
                iAtlasSize.value = [a0.W, a0.H]
                iPlaneSize.value = [a0.planeW, a0.planeH]
                iPlaneCols.value = a0.cols
                const T = (x = 0, y = 0, z = 0) => [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, x, y, z, 1] as any
                const O = (i: number) => offs[i]
                const m0 = O(0)
                if (m0) rM0.value = T(m0[0], m0[1], m0[2])
                const m1 = O(1)
                if (m1) rM1.value = T(m1[0], m1[1], m1[2])
                const m2 = O(2)
                if (m2) rM2.value = T(m2[0], m2[1], m2[2])
                const m3 = O(3)
                if (m3) rM3.value = T(m3[0], m3[1], m3[2])
                const m4 = O(4)
                if (m4) rM4.value = T(m4[0], m4[1], m4[2])
                const m5 = O(5)
                if (m5) rM5.value = T(m5[0], m5[1], m5[2])
                const m6 = O(6)
                if (m6) rM6.value = T(m6[0], m6[1], m6[2])
                const m7 = O(7)
                if (m7) rM7.value = T(m7[0], m7[1], m7[2])
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

        const uploadAtlasesGL = async (gl: any, atlases: Atlas[], offs: number[][]) => {
                const c = gl.webgl.context as WebGL2RenderingContext
                const pg = gl.webgl.program as WebGLProgram
                const a0 = atlases[0] || defaultAtlas
                iAtlasSize.value = [a0.W, a0.H]
                iPlaneSize.value = [a0.planeW, a0.planeH]
                iPlaneCols.value = a0.cols
                const T = (x = 0, y = 0, z = 0) => [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, x, y, z, 1] as any
                const O = (i: number) => offs[i]
                const m0 = O(0); if (m0) rM0.value = T(m0[0], m0[1], m0[2])
                const m1 = O(1); if (m1) rM1.value = T(m1[0], m1[1], m1[2])
                const m2 = O(2); if (m2) rM2.value = T(m2[0], m2[1], m2[2])
                const m3 = O(3); if (m3) rM3.value = T(m3[0], m3[1], m3[2])
                const m4 = O(4); if (m4) rM4.value = T(m4[0], m4[1], m4[2])
                const m5 = O(5); if (m5) rM5.value = T(m5[0], m5[1], m5[2])
                const m6 = O(6); if (m6) rM6.value = T(m6[0], m6[1], m6[2])
                const m7 = O(7); if (m7) rM7.value = T(m7[0], m7[1], m7[2])
                const tex: WebGLTexture[] = (uploadAtlasesGL as any)._tex || ((uploadAtlasesGL as any)._tex = Array(8).fill(null))
                const last: any[] = (uploadAtlasesGL as any)._last || ((uploadAtlasesGL as any)._last = Array(8).fill(null))
                const loc = (i: number) => c.getUniformLocation(pg, `iAtlas${i}`)
                const decode = async (A: Atlas) => {
                        if (A.buf && A.buf.byteLength) return await createImageBitmap(new Blob([A.buf], { type: 'image/png' }))
                        const res = await fetch(A.src)
                        const b = await res.blob()
                        return await createImageBitmap(b)
                }
                c.pixelStorei(c.UNPACK_ALIGNMENT, 1)
                c.pixelStorei(c.UNPACK_FLIP_Y_WEBGL, 0)
                const using = new Set(atlases.filter((a) => !!a))
                for (let i = 0; i < 8; i++) {
                        const A = atlases[i]
                        if (!A) continue
                        if (last[i] === A) continue
                        const im = await decode(A)
                        let t = tex[i]
                        if (!t) t = tex[i] = c.createTexture() as WebGLTexture
                        c.activeTexture(c.TEXTURE0 + i)
                        c.bindTexture(c.TEXTURE_2D, t)
                        c.texParameteri(c.TEXTURE_2D, c.TEXTURE_MIN_FILTER, c.NEAREST)
                        c.texParameteri(c.TEXTURE_2D, c.TEXTURE_MAG_FILTER, c.NEAREST)
                        c.texParameteri(c.TEXTURE_2D, c.TEXTURE_WRAP_S, c.CLAMP_TO_EDGE)
                        c.texParameteri(c.TEXTURE_2D, c.TEXTURE_WRAP_T, c.CLAMP_TO_EDGE)
                        c.texImage2D(c.TEXTURE_2D, 0, c.RGBA, c.RGBA, c.UNSIGNED_BYTE, im)
                        im.close?.()
                        const u = loc(i)
                        if (u) c.uniform1i(u, i)
                        last[i] = A
                }
                for (let i = 0; i < 8; i++) {
                        if (last[i] && !using.has(last[i])) {
                                if (tex[i]) c.deleteTexture(tex[i]), tex[i] = null as any
                                last[i] = null
                        }
                }
                c.bindTexture(c.TEXTURE_2D, null)
        }

        return { vert, frag, updateCamera, updateAtlas, updateAtlases, updateHover, uploadAtlasesGL }
}
