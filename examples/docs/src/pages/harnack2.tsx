import {
        useGL,
        Fn,
        vec2,
        iTime,
        vec3,
        vec4,
        float,
        int,
        bool,
        Loop,
        iResolution,
        constant,
        pow,
        sqrt,
        sin,
        cos,
        max,
        min,
        position,
        abs,
        length,
        tan,
        normalize,
        dot,
        exp,
        If,
        uniform,
        radians,
        mat3,
} from 'glre/src/react'
import { useDrag } from 'rege/react'

const PI = constant(3.14159265358979323846)
const epsilon = constant(0.025)
const max_iterations = int(100)
const animation_speed = constant(0.0)
const unit_shift = constant(3.0)
const scale = constant(9.0)
const use_grad_termination = constant(true)
const sphereCenter = vec3(0.0, 0.0, 0.0)
const sphereRadius = constant(1.0)
const outerRadius = sphereRadius.add(0.5)
const light = vec3(2.0, 10.0, 1.0)

const cameraRotation = uniform([0.0, 0.0], 'cameraRotation')
const cameraDistance = uniform(3.0, 'cameraDistance')

const gyroid = Fn(([pos]) => {
        const p = scale
                .mul(pos)
                .add(vec3(0.0, float(2.0).mul(PI).mul(animation_speed).mul(iTime), 0.0))
                .toVar('p')
        return sin(p.x)
                .mul(cos(p.y))
                .add(sin(p.y).mul(cos(p.z)))
                .add(sin(p.z).mul(cos(p.x)))
})

const gradient = Fn(([pos]) => {
        const p = scale
                .mul(pos)
                .add(vec3(0.0, float(2.0).mul(PI).mul(animation_speed).mul(iTime), 0.0))
                .toVar('p')
        return vec3(
                cos(p.x)
                        .mul(cos(p.y))
                        .sub(sin(p.z).mul(sin(p.x))),
                cos(p.y)
                        .mul(cos(p.z))
                        .sub(sin(p.x).mul(sin(p.y))),
                cos(p.z)
                        .mul(cos(p.x))
                        .sub(sin(p.y).mul(sin(p.z)))
        ).mul(scale)
})

const getRadius = Fn(([p]) => {
        return outerRadius.sub(length(p))
})

const intersectSphere = Fn(([ro, rd, center, radius]) => {
        const oc = ro.sub(center).toVar('oc')
        const a = dot(rd, rd).toVar('a')
        const b = float(2.0).mul(dot(oc, rd)).toVar('b')
        const c = dot(oc, oc).sub(radius.mul(radius)).toVar('c')
        const discr = b.mul(b).sub(float(4.0).mul(a).mul(c)).toVar('discr')

        const hasHit = discr.greaterThanEqual(0.0).toVar('hasHit')
        const t0 = float(-1.0).toVar('t0')
        const t1 = float(-1.0).toVar('t1')

        If(hasHit, () => {
                const sqrtDiscr = sqrt(discr).toVar('sqrtDiscr')
                const q = float(0.0).toVar('q')

                If(b.greaterThan(0.0), () => {
                        q.assign(float(-0.5).mul(b.add(sqrtDiscr)))
                }).Else(() => {
                        q.assign(float(-0.5).mul(b.sub(sqrtDiscr)))
                })

                t0.assign(q.div(a))
                t1.assign(c.div(q))

                If(t1.lessThan(t0), () => {
                        const temp = t0.toVar('temp')
                        t0.assign(t1)
                        t1.assign(temp)
                })
        })

        return vec3(hasHit.toFloat(), t0, t1)
})

const fragment = Fn(([position]) => {
        const rotation = cameraRotation.toVar('rotation')
        const distance = cameraDistance.toVar('distance')

        // Use rotation for camera matrix like original shader
        const cr = cos(rotation).toVar('cr')
        const sr = sin(rotation).toVar('sr')

        const v2wRotMat = mat3(
                cr.y,
                0.0,
                sr.y.negate(),
                sr.x.mul(sr.y),
                cr.x,
                cr.y.mul(sr.x),
                cr.x.mul(sr.y),
                sr.x.negate(),
                cr.x.mul(cr.y)
        ).toVar('v2wRotMat')

        const camPos = vec3(0.0, 0.0, 0.0)
                .add(v2wRotMat.mul(vec3(0.0, 0.0, distance)))
                .toVar('camPos')

        const fovY = constant(50.0)
        const tanHalfFov = vec2(tan(radians(fovY).mul(0.5))).toVar('tanHalfFov')
        tanHalfFov.x.assign(tanHalfFov.x.mul(iResolution.x.div(iResolution.y)))

        const cCoord = position.xy.div(iResolution.xy).mul(2.0).sub(1.0).toVar('cCoord')
        const vDir = normalize(vec3(cCoord.mul(tanHalfFov), -1.0)).toVar('vDir')
        const rd = v2wRotMat.mul(vDir).toVar('rd')
        const ro = camPos.toVar('ro')

        const tmax = constant(10.0)
        const levelset = sin(animation_speed.mul(iTime)).toVar('levelset')

        const sphereResult = intersectSphere(ro, rd, sphereCenter, sphereRadius).toVar('sphereResult')
        const hitSphere = sphereResult.x.greaterThan(0.5).toVar('hitSphere')
        const t0 = sphereResult.y.toVar('t0')
        const t1 = sphereResult.z.toVar('t1')

        const t = t0.toVar('t')
        const didHit = bool(false).toVar('didHit')
        const normal = vec3(0.0).toVar('normal')

        If(hitSphere.and(t1.greaterThan(0.0)), () => {
                If(t0.greaterThan(0.0), () => {
                        t.assign(t0)
                })
                const tMax = min(tmax, t1).toVar('tMax')

                const pos = ro.add(t.mul(rd)).toVar('pos')
                const maxSteps = bool(false).toVar('maxSteps')
                const t_overstep = float(0.0).toVar('t_overstep')
                const iters = int(0).toVar('iters')

                Loop(max_iterations, () => {
                        If(t.lessThan(tMax).and(didHit.not()).and(maxSteps.not()), () => {
                                iters.assign(iters.add(int(1)))
                                pos.assign(ro.add(t.mul(rd)).add(t_overstep.mul(rd)))

                                If(iters.lessThanEqual(max_iterations), () => {
                                        const val = gyroid(pos).toVar('val')
                                        const gradF = gradient(pos).toVar('gradF')

                                        // Simple levelset calculation without complex type inference
                                        const offset_levelset = levelset.toVar('offset_levelset')

                                        // Simplified Harnack step calculation
                                        const R = getRadius(pos).toVar('R')
                                        const shift = exp(sqrt(2.0).mul(R)).mul(unit_shift).toVar('shift')
                                        const a = val.add(shift).div(offset_levelset.add(shift)).toVar('a')
                                        const term1 = float(27.0).mul(a).toVar('term1')
                                        const term2 = float(3.0)
                                                .mul(
                                                        sqrt(
                                                                float(3.0).mul(
                                                                        pow(a, float(3.0)).add(
                                                                                float(81.0).mul(pow(a, float(2.0)))
                                                                        )
                                                                )
                                                        )
                                                )
                                                .toVar('term2')
                                        const u = pow(term1.add(term2), float(1.0).div(float(3.0))).toVar('u')
                                        const r = R.mul(abs(u.div(float(3.0)).sub(a.div(u)).sub(float(1.0)))).toVar('r')

                                        // Simple convergence check
                                        const eps = float(0.0).toVar('eps')
                                        If(use_grad_termination, () => {
                                                eps.assign(epsilon.mul(length(gradF)))
                                        }).Else(() => {
                                                eps.assign(epsilon)
                                        })
                                        const close = abs(val.sub(offset_levelset)).lessThan(eps).toVar('close')

                                        If(r.greaterThanEqual(t_overstep).and(close), () => {
                                                normal.assign(gradF)
                                                didHit.assign(true)
                                        }).Else(() => {
                                                const stepSize = float(0.0).toVar('stepSize')
                                                If(r.greaterThanEqual(t_overstep), () => {
                                                        stepSize.assign(t_overstep.add(r))
                                                        t_overstep.assign(r.mul(0.75))
                                                }).Else(() => {
                                                        stepSize.assign(float(0.0))
                                                        t_overstep.assign(float(0.0))
                                                })
                                                t.assign(t.add(stepSize))
                                        })
                                }).Else(() => {
                                        maxSteps.assign(true)
                                })
                        })
                })
        })

        const col = vec3(1.0).toVar('col')

        If(didHit, () => {
                const nor = normalize(normal).toVar('nor')
                const baseColor = vec3(0.7, 0.6, 0.7).toVar('baseColor')
                const outwardNormal = vec3(0.0).toVar('outwardNormal')
                If(dot(nor, rd).lessThan(0.0), () => {
                        outwardNormal.assign(nor)
                }).Else(() => {
                        outwardNormal.assign(nor.negate())
                })
                const lightDir = normalize(light.sub(ro.add(t.mul(rd)))).toVar('lightDir')
                const diffuse = max(dot(lightDir, outwardNormal), 0.3).toVar('diffuse')
                col.assign(baseColor.mul(diffuse))
        })

        return vec4(sqrt(col), 1.0)
})

export default function App() {
        const drag = useDrag(() => {
                update()
        })

        const update = () => {
                const [x, y] = drag.offset
                // Convert mouse movement to rotation angles
                const rotX = -(y / 100) // vertical rotation
                const rotY = -(x / 100) // horizontal rotation
                cameraRotation.value = [rotX, rotY]
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
