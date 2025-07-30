import {
        Fn,
        If,
        Loop,
        bool,
        constant,
        float,
        iResolution,
        int,
        mat3,
        position,
        sqrt,
        struct,
        uniform,
        useGL,
        vec2,
        vec3,
        vec4,
} from 'glre/src/react'
import { useDrag } from 'rege/react'

const epsilon = constant(float(0.01))
const max_iterations = constant(int(250))
const unit_shift = constant(float(3))
const thickness = constant(float(0.1))
const baseColor = constant(vec3(0.7, 0.6, 0.7))
const sphereCenter = constant(vec3(0, 0, 0))
const sphereRadius = constant(float(1))
const metallic = constant(float(0.01))
const roughness = constant(float(0.01))
const ambient = constant(float(0.01))
const scale = uniform(float(4))
const lightPosition = uniform(vec3(10, 10, 1))
const cameraRotation = uniform(vec2(0))
const cameraPosition = uniform(vec3(0, 0, 3))

const gyroid = Fn(([pos]) => {
        const p = scale.mul(pos).toVar('p')
        const c = p.cos().toVar('c')
        const s = p.sin().toVar('s')
        const t = s.x.mul(c.y).add(s.y.mul(c.z)).add(s.z.mul(c.x))
        const n = vec3(
                c.x.mul(c.y).sub(s.z.mul(s.x)),
                c.y.mul(c.z).sub(s.x.mul(s.y)),
                c.z.mul(c.x).sub(s.y.mul(s.z))
        ).mul(scale)
        return Ray({ hit: bool(true), t, n })
})

const closeToLevelset = Fn(([f, levelset, tol, gradNorm]) => {
        const eps = tol.mul(gradNorm).toVar('eps')
        return f.sub(levelset).abs().lessThan(eps)
})

const getMaxStep4D = Fn(([fx, R, levelset, shift]) => {
        const a = fx.add(shift).div(levelset.add(shift)).toVar('a')
        const u = a.pow(3).mul(3).add(a.pow(2).mul(81)).sqrt().mul(3).add(a.mul(27)).pow(0.33333).toVar('u')
        return u.div(3).sub(a.div(u)).sub(1).abs().mul(R)
})

const Ray = struct({
        hit: bool(),
        t: float(),
        n: vec3(),
})

const intersectSphere = Fn(([ro, rd, center, radius]) => {
        const a = ro.sub(center).toVar('a')
        const b = a.dot(rd).toVar('b')
        const c = a.dot(a).sub(radius.mul(radius)).toVar('c')
        const d = b.mul(b).sub(c).toVar('d')
        If(d.lessThan(0), () => {
                return Ray({ hit: bool(false), t: float(-1), n: vec3(0) })
        })
        const t = b.negate().sub(d.sqrt()).toVar('t')
        If(t.lessThan(0), () => {
                return Ray({ hit: bool(false), t: float(-1), n: vec3(0) })
        })
        const n = ro.add(rd.mul(t)).sub(center).div(radius).toVar('normal')
        return Ray({ hit: bool(true), t, n })
})

const harnack = Fn(([ro, rd]) => {
        const t = float(0).toVar('t')
        const levelset = float(0).toVar('levelset')
        const sphereHit = intersectSphere(ro, rd, sphereCenter, sphereRadius).toVar('sphereHit')
        If(sphereHit.hit.not(), () => {
                return Ray({ hit: bool(false), t: float(0), n: vec3(0) })
        })
        If(sphereHit.t.greaterThan(0), () => {
                t.assign(sphereHit.t)
        })
        const pos = ro.add(t.mul(rd)).toVar('pos')
        const gyr = gyroid(pos).toVar('gyr')
        const val = gyr.t.toVar('val')
        const n = gyr.n.toVar('n')
        const eps = epsilon.mul(n.length()).toVar('eps')
        If(
                levelset
                        .sub(thickness)
                        .sub(val)
                        .max(val.sub(levelset.add(thickness)))
                        .lessThan(eps),
                () => {
                        return Ray({ hit: bool(true), t, n })
                }
        )
        const overstep = float(0).toVar('overstep')
        const ray = Ray({ hit: bool(false), t: float(0), n: vec3(0) }).toVar('ray')
        Loop(max_iterations, () => {
                pos.assign(ro.add(t.mul(rd)).add(overstep.mul(rd)))
                const loopGyr = gyroid(pos).toVar('loopGyr')
                val.assign(loopGyr.t)
                n.assign(loopGyr.n)
                const R = sphereRadius.add(0.5).sub(pos.length()).toVar('R')
                const shift = sqrt(2).mul(R).exp().mul(unit_shift).toVar('shift')
                const r = getMaxStep4D(val, R, levelset, shift).toVar('r')
                If(r.greaterThanEqual(overstep).and(closeToLevelset(val, levelset, epsilon, n.length())), () => {
                        ray.assign(Ray({ hit: bool(true), t, n }))
                })
                const stepSize = r.greaterThanEqual(overstep).toFloat().mul(overstep.add(r)).toVar('stepSize')
                overstep.assign(r.greaterThanEqual(overstep).toFloat().mul(r.mul(0.75)))
                t.assign(t.add(stepSize))
        })
        return ray
})

const shade = Fn(([hitPos = vec3(), rd, nor]) => {
        const outwardNormal = nor
                .dot(rd)
                .greaterThan(0)
                .toFloat()
                .mul(nor.negate())
                .add(nor.dot(rd).lessThanEqual(0).toFloat().mul(nor))
                .toVar('outwardNormal')
        const lightDir = lightPosition.sub(hitPos).normalize().toVar('lightDir')
        const viewDir = rd.negate().toVar('viewDir')
        const halfDir = lightDir.add(viewDir).normalize().toVar('halfDir')
        const dotNL = lightDir.dot(outwardNormal).max(0).toVar('dotNL')
        const dotNV = viewDir.dot(outwardNormal).max(0).toVar('dotNV')
        const dotNH = halfDir.dot(outwardNormal).max(0).toVar('dotNH')
        const dotLH = lightDir.dot(halfDir).max(0).toVar('dotLH')
        const alpha = roughness.mul(roughness).toVar('alpha')
        const alphaSqr = alpha.mul(alpha).toVar('alphaSqr')
        const denom = dotNH.mul(dotNH).mul(alphaSqr.sub(1)).add(1).toVar('denom')
        const D = alphaSqr.div(constant(3.14159).mul(denom).mul(denom)).toVar('D')
        const dotLH5 = dotLH.oneMinus().pow(5).toVar('dotLH5')
        const F0 = constant(0.2).toVar('F0')
        const F = F0.add(F0.oneMinus().mul(dotLH5)).toVar('F')
        const k = alpha.div(2).toVar('k')
        const G1L = float(1).div(dotNL.mul(k.oneMinus()).add(k)).toVar('G1L')
        const G1V = float(1).div(dotNV.mul(k.oneMinus()).add(k)).toVar('G1V')
        const G = G1L.mul(G1V).toVar('G')
        const specular = D.mul(F).mul(G).toVar('specular')
        const diffuse = baseColor.pow(vec3(2.2)).mul(dotNL).toVar('diffuse')
        const fresnel = viewDir.dot(outwardNormal).oneMinus().max(0).toVar('fresnel')
        const fresnelPow = metallic.mul(1.5).add(3.5).toVar('fresnelPow')
        const fresnelFactor = fresnel.pow(fresnelPow).toVar('fresnelFactor')
        const reflection = baseColor.mul(fresnelFactor).toVar('reflection')
        return diffuse.mul(fresnelFactor.oneMinus()).add(reflection).add(vec3(specular)).add(vec3(ambient)).min(vec3(1))
})

const fragment = Fn(([position = vec4()]) => {
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
                const hitPos = ro.add(ray.t.mul(rd)).toVar('hitPos')
                const shadedColor = shade(hitPos, rd, nor).toVar('shadedColor')
                return vec4(shadedColor.pow(vec3(1.0 / 2.2)), 1)
        })
        return vec4(0)
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
