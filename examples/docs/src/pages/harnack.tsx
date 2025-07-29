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
        struct,
} from 'glre/src/react'
import { useDrag } from 'rege/react'

const epsilon = constant(0.025)
const max_iterations = constant(int(100))
const unit_shift = constant(3)
const thickness = constant(0.1)
const scale = constant(9)
const sphereCenter = constant(vec3(0, 0, 0))
const sphereRadius = constant(1)
const lightPosition = vec3(2, 10, 1)
const cameraRotation = uniform([0, 0])
const cameraPosition = uniform([0, 0, 3])

const gyroid = Fn(([pos]) => {
        const p = scale.mul(pos).toVar('p')
        const c = p.cos().toVar('c')
        const s = p.sin().toVar('s')
        const value = s.x.mul(c.y).add(s.y.mul(c.z)).add(s.z.mul(c.x)).toVar('value')
        const grad = vec3(
                c.x.mul(c.y).sub(s.z.mul(s.x)),
                c.y.mul(c.z).sub(s.x.mul(s.y)),
                c.z.mul(c.x).sub(s.y.mul(s.z))
        )
                .mul(scale)
                .toVar('grad')
        return Ray({ hit: bool(true), p: value, n: grad })
})

const getRadius = Fn(([p]) => {
        return sphereRadius.add(0.5).sub(p.length())
})

const intersectSphere = Fn(([ro, rd, center, radius]) => {
        const a = ro.sub(center).toVar('a')
        const b = a.dot(rd).toVar('b')
        const c = a.dot(a).sub(radius.mul(radius)).toVar('c')
        const d = b.mul(b).sub(c).toVar('d')
        If(d.lessThan(0), () => {
                return Ray({ hit: bool(false), p: float(-1), n: vec3(0) })
        })
        const t = b.negate().sub(d.sqrt()).toVar('t')
        If(t.lessThan(0), () => {
                return Ray({ hit: bool(false), p: float(-1), n: vec3(0) })
        })
        const hitPos = ro.add(rd.mul(t)).toVar('hitPos')
        const normal = hitPos.sub(center).div(radius).toVar('normal')
        return Ray({ hit: bool(true), p: t, n: normal })
})

const closeToLevelset = Fn(([f, levelset, tol, gradNorm]) => {
        const eps = tol.mul(gradNorm).toVar('eps')
        return f.sub(levelset).abs().lessThan(eps)
})

const getMaxStep4D = Fn(([fx, R, levelset, shift]) => {
        const a = fx.add(shift).div(levelset.add(shift)).toVar('a')
        const inner = a.pow(3).mul(3).add(a.pow(2).mul(81)).sqrt().mul(3).add(a.mul(27)).toVar('inner')
        const u = inner.pow(0.33333).toVar('u')
        return u.div(3).sub(a.div(u)).sub(1).abs().mul(R)
})

const Ray = struct({
        hit: bool(),
        p: float(),
        n: vec3(),
})

const harnack = Fn(([ro, rd]) => {
        const t = float(0).toVar('t')
        const levelset = float(0).toVar('levelset')
        const sphereHit = intersectSphere(ro, rd, sphereCenter, sphereRadius).toVar('sphereHit')
        If(sphereHit.hit.not(), () => {
                return Ray({ hit: bool(false), p: float(0), n: vec3(0) })
        })
        If(sphereHit.p.greaterThan(0), () => {
                t.assign(sphereHit.p)
        })
        const pos = ro.add(t.mul(rd)).toVar('pos')
        const gyr = gyroid(pos).toVar('gyr')
        const val = gyr.p.toVar('val')
        const gradF = gyr.n.toVar('gradF')
        const eps = epsilon.mul(gradF.length()).toVar('eps')
        If(
                levelset
                        .sub(thickness)
                        .sub(val)
                        .max(val.sub(levelset.add(thickness)))
                        .lessThan(eps),
                () => {
                        return Ray({ hit: bool(true), p: t, n: gradF })
                }
        )
        const overstep = float(0).toVar('overstep')
        const ray = Ray({ hit: bool(false), p: float(0), n: vec3(0) }).toVar('ray')
        Loop(max_iterations, () => {
                pos.assign(ro.add(t.mul(rd)).add(overstep.mul(rd)))
                const loopGyr = gyroid(pos).toVar('loopGyr')
                val.assign(loopGyr.p)
                gradF.assign(loopGyr.n)
                const R = getRadius(pos).toVar('R')
                const shift = sqrt(2).mul(R).exp().mul(unit_shift).toVar('shift')
                const r = getMaxStep4D(val, R, levelset, shift).toVar('r')
                If(r.greaterThanEqual(overstep).and(closeToLevelset(val, levelset, epsilon, gradF.length())), () => {
                        ray.assign(Ray({ hit: bool(true), p: t, n: gradF }))
                })
                const stepSize = r.greaterThanEqual(overstep).toFloat().mul(overstep.add(r)).toVar('stepSize')
                overstep.assign(r.greaterThanEqual(overstep).toFloat().mul(r.mul(0.75)))
                t.assign(t.add(stepSize))
        })
        return ray
})

const fragment = Fn(([position]) => {
        const cr = cameraRotation.cos().toVar('cr')
        const sr = cameraRotation.sin().toVar('sr')
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
        const camPos = v2wRotMat.mul(cameraPosition).toVar('camPos')
        const tanHalfFov = constant(50).radians().mul(0.5).tan().toVec2().toVar('tanHalfFov')
        tanHalfFov.x.assign(tanHalfFov.x.mul(iResolution.x.div(iResolution.y)))
        const cCoord = position.xy.div(iResolution.xy).mul(2).sub(1).toVar('cCoord')
        const vDir = vec3(cCoord.mul(tanHalfFov), -1).normalize().toVar('vDir')
        const rd = v2wRotMat.mul(vDir).toVar('rd')
        const ro = camPos.toVar('ro')
        const ray = harnack(ro, rd).toVar('ray')
        If(ray.hit, () => {
                const nor = ray.n.normalize().toVar('nor')
                const baseColor = vec3(0.9, 0.8, 0.9).toVar('baseColor')
                const finalNormal = float(0)
                        .greaterThan(nor.dot(rd))
                        .toFloat()
                        .mul(nor)
                        .add(float(0).lessThanEqual(nor.dot(rd)).toFloat().mul(nor.negate()))
                        .toVar('finalNormal')
                const lightDir = lightPosition
                        .sub(ro.add(ray.p.mul(rd)))
                        .normalize()
                        .toVar('lightDir')
                const finalColor = baseColor
                        .mul(lightDir.dot(finalNormal).max(0.2).add(0.4))
                        .add(vec3(1).mul(finalNormal.dot(rd.negate()).pow(2).mul(0.3)))
                        .toVar('finalColor')
                return vec4(finalColor, 1)
        })
        return vec4(1)
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
