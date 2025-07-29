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
const max_iterations = constant(int(100))
const unit_shift = constant(3)
const wall_thickness = constant(0.1)
const scale = constant(9)
const sphereCenter = constant(vec3(0, 0, 0))
const sphereRadius = constant(1)
const outerRadius = sphereRadius.add(0.5)
const lightPosition = vec3(2, 10, 1)
const cameraRotation = uniform([0, 0])
const cameraDistance = uniform(3)
const use_grad_termination = constant(true)

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
        return outerRadius.sub(p.length())
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
        const eps = use_grad_termination
                .toFloat()
                .mul(tol.mul(gradNorm))
                .add(use_grad_termination.not().toFloat().mul(tol))
                .toVar('eps')
        return f.sub(levelset).abs().lessThan(eps)
})

const getMaxStep4D = Fn(([fx, R, levelset, shift]) => {
        const a = fx.add(shift).div(levelset.add(shift)).toVar('a')
        const inner = a.pow(3).mul(3).add(a.pow(2).mul(81)).sqrt().mul(3).add(a.mul(27)).toVar('inner')
        const u = inner.pow(0.33333).toVar('u')
        return u.div(3).sub(a.div(u)).sub(1).abs().mul(R)
})

const harnack = Fn(([ro, rd, tmax]) => {
        const t = float(0).toVar('t')
        const levelset = float(0).toVar('levelset')
        const hitResult = intersectSphere(ro, rd, sphereCenter, sphereRadius).toVar('hitResult')
        const hitSphere = hitResult.x.greaterThan(0.5).toVar('hitSphere')
        const t0 = hitResult.y.toVar('t0')
        const t1 = hitResult.z.toVar('t1')
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
        const eps = epsilon.mul(gradF.length()).toVar('eps')
        If(
                levelset
                        .sub(wall_thickness)
                        .sub(val)
                        .max(val.sub(levelset.add(wall_thickness)))
                        .lessThan(eps),
                () => {
                        return vec4(true, t, gradF)
                }
        )
        const t_overstep = float(0).toVar('t_overstep')
        const found = bool(false).toVar('found')
        const result = vec4(false, 0, vec3(0)).toVar('result')
        Loop(max_iterations, () => {
                If(t.greaterThanEqual(tMax).or(found), () => {
                        return result
                })
                pos.assign(ro.add(t.mul(rd)).add(t_overstep.mul(rd)))
                val.assign(gyroid(pos))
                gradF.assign(gradient(pos))
                const R = getRadius(pos).toVar('R')
                const shift = sqrt(2).mul(R).exp().mul(unit_shift).toVar('shift')
                const r = getMaxStep4D(val, R, levelset, shift).toVar('r')
                If(r.greaterThanEqual(t_overstep).and(closeToLevelset(val, levelset, epsilon, gradF.length())), () => {
                        result.assign(vec4(true, t, gradF))
                        found.assign(true)
                })
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
        return result
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
        const normal = result.zyw.toVar('normal')
        const col = vec3(1).toVar('col')
        If(didHit, () => {
                const nor = normal.normalize().toVar('nor')
                const baseColor = vec3(0.9, 0.8, 0.9).toVar('baseColor')
                const outwardNormal = float(0).greaterThan(nor.dot(rd)).toVar('outwardNormal')
                const finalNormal = outwardNormal
                        .toFloat()
                        .mul(nor)
                        .add(outwardNormal.not().toFloat().mul(nor.negate()))
                        .toVar('finalNormal')
                const lightDir = lightPosition
                        .sub(ro.add(hit_t.mul(rd)))
                        .normalize()
                        .toVar('lightDir')
                const diffuse = lightDir.dot(finalNormal).max(0.2).toVar('diffuse')
                const ambient = constant(0.4).toVar('ambient')
                const fresnel = finalNormal.dot(rd.negate()).pow(2).mul(0.3).toVar('fresnel')
                const finalColor = baseColor.mul(diffuse.add(ambient)).add(vec3(1).mul(fresnel)).toVar('finalColor')
                col.assign(finalColor)
        })
        return vec4(col, 1)
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
