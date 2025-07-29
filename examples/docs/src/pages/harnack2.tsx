import {
        useGL,
        Fn,
        vec3,
        vec4,
        float,
        int,
        bool,
        Loop,
        iResolution,
        constant,
        position,
        sqrt,
        If,
        uniform,
        mat3,
} from 'glre/src/react'
import { useDrag } from 'rege/react'

const epsilon = constant(0.025)
const max_iterations = constant(int(2500))
const unit_shift = constant(3)
const wall_thickness = constant(0.1)
const scale = constant(9)
const sphereCenter = vec3(0, 0, 0)
const sphereRadius = constant(1)
const lightPosition = vec3(2, 10, 1)
const cameraRotation = uniform([0, 0])
const cameraDistance = uniform(3)

const gyroid = Fn(([pos]) => {
        const p = scale.mul(pos).toVar('p')
        return p.x.sin().mul(p.y.cos()).add(p.y.sin().mul(p.z.cos())).add(p.z.sin().mul(p.x.cos()))
})

const gradient = Fn(([pos]) => {
        const p = scale.mul(pos).toVar('p')
        return vec3(
                p.x.cos().mul(p.y.cos()).sub(p.z.sin().mul(p.x.sin())),
                p.y.cos().mul(p.z.cos()).sub(p.x.sin().mul(p.y.sin())),
                p.z.cos().mul(p.x.cos()).sub(p.y.sin().mul(p.z.sin()))
        ).mul(scale)
})

const getRadius = Fn(([p]) => {
        return sphereRadius.add(0.5).sub(p.length())
})

const intersectSphere = Fn(([ro, rd, center, radius]) => {
        const a = rd.dot(rd).toVar('a')
        const b = rd.dot(ro.sub(center)).mul(2).toVar('b')
        const c = ro.sub(center).dot(ro.sub(center)).sub(radius.mul(radius)).toVar('c')
        const discr = b.mul(b).sub(a.mul(c).mul(4)).toVar('discr')
        If(discr.lessThan(0), () => {
                return vec3(0, -1, -1)
        })
        If(discr.lessThan(0.0001), () => {
                const t = b.negate().mul(0.5).div(a).toVar('t')
                return vec3(1, t, t)
        })
        const q = float(0).toVar('q')
        If(b.greaterThan(0), () => {
                q.assign(b.add(discr.sqrt()).mul(-0.5))
        }).Else(() => {
                q.assign(b.sub(discr.sqrt()).mul(-0.5))
        })
        const t0 = q.div(a).toVar('t0')
        const t1 = c.div(q).toVar('t1')
        If(t1.lessThan(t0), () => {
                return vec3(1, t1, t0)
        })
        return vec3(1, t0, t1)
})

const closeToLevelset = Fn(([f, levelset, tol, gradNorm]) => {
        const eps = tol.mul(gradNorm).toVar('eps')
        return f.sub(levelset).abs().lessThan(eps)
})

const betweenLevelsets = Fn(([f, loBound, hiBound, tol, gradNorm]) => {
        const eps = tol.mul(gradNorm).toVar('eps')
        return loBound.sub(f).max(f.sub(hiBound)).lessThan(eps)
})

const getMaxStep4D = Fn(([fx, R, levelset, shift]) => {
        const a = fx.add(shift).div(levelset.add(shift)).toVar('a')
        const u = a.pow(3).mul(3).sqrt().mul(3).add(a.mul(27)).pow(0.33333).toVar('u')
        return u.div(3).sub(a.div(u)).sub(1).abs().mul(R)
})

const harnack = Fn(([ro, rd, tmax]) => {
        const iters = int(0).toVar('iters')
        const t = float(0).toVar('t')
        const levelset = float(0).toVar('levelset')
        const maxSteps = bool(false).toVar('maxSteps')
        const res = intersectSphere(ro, rd, sphereCenter, sphereRadius).toVar('res')
        const hitSphere = res.x.greaterThan(0.5).toVar('hitSphere')
        const t0 = res.y.toVar('t0')
        const t1 = res.z.toVar('t1')
        const tMax = tmax.toVar('tMax')
        If(hitSphere.not().or(tmax.lessThan(0)), () => {
                return vec4(false, 0, vec3(0))
        })
        If(t0.greaterThan(0), () => {
                t.assign(t0)
        })
        If(t1.lessThan(tmax), () => {
                tMax.assign(t1)
        })
        const pos = ro.add(t.mul(rd)).toVar('pos')
        const val = gyroid(pos).toVar('val')
        const gradF = gradient(pos).toVar('gradF')
        If(
                betweenLevelsets(
                        val,
                        levelset.sub(wall_thickness),
                        levelset.add(wall_thickness),
                        epsilon,
                        gradF.length()
                ),
                () => {
                        return vec4(true, t, pos)
                }
        )
        const t_overstep = float(0).toVar('t_overstep')
        Loop(max_iterations, () => {
                If(t.lessThan(tMax), () => {
                        iters.assign(iters.add(int(1)))
                        pos.assign(ro.add(t.mul(rd)).add(t_overstep.mul(rd)))
                        If(iters.greaterThan(max_iterations), () => {
                                maxSteps.assign(true)
                                return vec4(false, t, vec3(0))
                        })
                        const val = gyroid(pos).toVar('val')
                        const gradF = gradient(pos).toVar('gradF')
                        const offset_levelset = float(0).toVar('offset_levelset')
                        If(val.greaterThan(levelset.add(wall_thickness)), () => {
                                offset_levelset.assign(levelset.add(wall_thickness))
                        })
                                .ElseIf(val.lessThan(levelset.sub(wall_thickness)), () => {
                                        offset_levelset.assign(levelset.sub(wall_thickness))
                                })
                                .Else(() => {
                                        offset_levelset.assign(levelset)
                                })
                        const R = getRadius(pos).toVar('R')
                        const shift = sqrt(2).mul(R).exp().mul(unit_shift).toVar('shift')
                        const r = getMaxStep4D(val, R, offset_levelset, shift).toVar('r')
                        If(
                                r
                                        .greaterThanEqual(t_overstep)
                                        .and(closeToLevelset(val, offset_levelset, epsilon, gradF.length())),
                                () => {
                                        return vec4(true, t, gradF)
                                }
                        )
                        const stepSize = float(0).toVar('stepSize')
                        const new_overstep = float(0).toVar('new_overstep')
                        If(r.greaterThanEqual(t_overstep), () => {
                                stepSize.assign(t_overstep.add(r))
                                new_overstep.assign(r.mul(0.75))
                        }).Else(() => {
                                stepSize.assign(0)
                                new_overstep.assign(0)
                        })
                        t_overstep.assign(new_overstep)
                        t.assign(t.add(stepSize))
                })
        })
        return vec4(false, t, vec3(0))
})

const fragment = Fn(([position]) => {
        const camRot = cameraRotation.toVar('camRot')
        const cr = camRot.cos().toVar('cr')
        const sr = camRot.sin().toVar('sr')
        const v2wRotMat = mat3(
                cr.y,
                0,
                sr.y.negate(),
                sr.x.mul(sr.y),
                cr.x,
                cr.y.mul(sr.x),
                cr.x.mul(sr.y),
                sr.x.negate(),
                cr.x.mul(cr.y)
        ).toVar('v2wRotMat')
        const camPos = v2wRotMat.mul(vec3(0, 0, cameraDistance)).toVar('camPos')
        const fovY = constant(50).toVar('fovY')
        const tanHalfFov = fovY.radians().mul(0.5).tan().toVec2().toVar('tanHalfFov')
        tanHalfFov.x.assign(tanHalfFov.x.mul(iResolution.x.div(iResolution.y)))
        const cCoord = position.xy.div(iResolution.xy).mul(2).sub(1).toVar('cCoord')
        const vDir = vec3(cCoord.mul(tanHalfFov), -1).normalize().toVar('vDir')
        const rd = v2wRotMat.mul(vDir).toVar('rd')
        const ro = camPos.toVar('ro')
        const tmax = constant(10).toVar('tmax')
        const result = harnack(ro, rd, tmax).toVar('result')
        const didHit = result.x.greaterThan(0.5).toVar('didHit')
        const hit_t = result.y.toVar('hit_t')
        const normal = result.yzw.toVar('normal')
        const col = vec3(1).toVar('col')
        If(didHit, () => {
                const nor = normal.normalize().toVar('nor')
                const baseColor = vec3(0.7, 0.6, 0.7).toVar('baseColor')
                const outwardNormal = float(0).lessThan(nor.dot(rd)).toVar('outwardNormal')
                const finalNormal = outwardNormal
                        .toFloat()
                        .mul(nor)
                        .add(outwardNormal.not().toFloat().mul(nor.negate()))
                        .toVar('finalNormal')
                const lightDir = lightPosition
                        .sub(ro.add(hit_t.mul(rd)))
                        .normalize()
                        .toVar('lightDir')
                const diffuse = lightDir.dot(finalNormal).max(0.3).toVar('diffuse')
                col.assign(baseColor.mul(diffuse))
        })
        return vec4(col.sqrt(), 1)
})

export default function App() {
        const drag = useDrag(() => {
                update()
        })
        const update = () => {
                const [x, y] = drag.offset
                const rotX = y / 200
                const rotY = x / 200
                cameraRotation.value = [-rotX, -rotY]
        }
        const gl = useGL({
                fs: fragment(position),
                loop() {
                        drag.offset[0] += 0.1
                        update()
                },
        })
        return (
                <div ref={drag.ref} style={{ touchAction: 'none' }}>
                        <canvas ref={gl.ref} />
                </div>
        )
}
