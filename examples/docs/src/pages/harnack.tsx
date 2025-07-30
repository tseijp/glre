import {
        Fn,
        If,
        Loop,
        bool,
        constant,
        float,
        iResolution,
        iTime,
        int,
        mat3,
        position,
        radians,
        sqrt,
        struct,
        uniform,
        useGL,
        vec2,
        vec3,
        vec4,
} from 'glre/src/react'
import { useControls } from 'leva'
import { useDrag } from 'rege/react'

// constant
const iterations = constant(int(200))
const epsilon = constant(float(0.01))
const lightScale = constant(float(0.02))
const lightPosition = vec3(iTime.sin(), iTime.sin().mul(2), iTime.cos())

// uniforms
const thickness = uniform(float(), 'thickness')
const ambient = uniform(float(), 'ambient')
const metallic = uniform(float(), 'metallic')
const roughness = uniform(float(), 'roughness')
const scale = uniform(float(), 'scale')
const radius = uniform(float(), 'radius')
const unitShift = uniform(float(), 'unitShift')
const baseColor = uniform(vec3(), 'baseColor')
const cameraRotation = uniform(vec2(0))
const cameraPosition = uniform(vec3(), 'cameraPosition')

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

const intersectSphere = Fn(([ro, rd, center, radius]) => {
        const a = ro.sub(center).toVar('a')
        const b = a.dot(rd).toVar('b')
        const c = a.dot(a).sub(radius.mul(radius)).toVar('c')
        const d = b.mul(b).sub(c).toVar('d')
        const ray = Ray({ hit: bool(false), t: float(-1), n: vec3(0) })
        If(d.lessThan(0), () => {
                return ray
        })
        ray.t = b.negate().sub(d.sqrt()).toVar('t')
        If(ray.t.lessThan(0), () => {
                return ray
        })
        ray.n = rd.mul(ray.t).add(ro).sub(center).div(radius).toVar('normal')
        ray.hit = bool(true)
        return ray
})

const harnack = Fn(([ro, rd]) => {
        const levelset = float(0).toVar('levelset')
        const sphere = intersectSphere(ro, rd, vec3(0), radius).toVar('sphere')
        If(sphere.hit.not(), () => {
                return Ray({ hit: bool(false), t: float(0), n: vec3(0) })
        })
        const pos = sphere.t.mul(rd).add(ro).toVar('pos')
        const gyr = gyroid(pos).toVar('gyr')
        If(
                levelset
                        .sub(thickness)
                        .sub(gyr.t)
                        .max(gyr.t.sub(levelset.add(thickness)))
                        .lessThan(epsilon.mul(gyr.n.length())),
                () => {
                        return gyr
                }
        )
        const t = sphere.t.toVar('t')
        const overstep = float(0).toVar('overstep')
        Loop(iterations, () => {
                pos.assign(t.mul(rd).add(ro).add(overstep.mul(rd)))
                gyr.assign(gyroid(pos))
                const R = radius.add(0.5).sub(pos.length()).toVar('R')
                const shift = sqrt(2).mul(R).exp().mul(unitShift).toVar('shift')
                const r = getMaxStep4D(gyr.t, R, levelset, shift).toVar('r')

                If(r.greaterThan(overstep), () => {
                        If(closeToLevelset(gyr.t, levelset, epsilon, gyr.n.length()), () => {
                                gyr.t = t
                                return gyr
                        })
                        overstep.assign(r.mul(0.75))
                        t.assign(t.add(overstep.add(r)))
                })
        })
        gyr.t.assign(t)
        return gyr
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
        const alphaSqr = roughness.pow(4).toVar('alphaSqr')
        const denom = dotNH.mul(dotNH).mul(alphaSqr.sub(1)).add(1).toVar('denom')
        const D = alphaSqr.div(constant(3.14159).mul(denom).mul(denom)).toVar('D')
        const dotLH5 = dotLH.oneMinus().pow(5).toVar('dotLH5')
        const F = constant(0.2).add(constant(0.8).mul(dotLH5)).toVar('F')
        const k = roughness.mul(roughness).div(2).toVar('k')
        const G = float(1)
                .div(dotNL.mul(k.oneMinus()).add(k))
                .mul(float(1).div(dotNV.mul(k.oneMinus()).add(k)))
                .toVar('G')
        const specular = D.mul(F).mul(G).toVar('specular')
        const diffuse = baseColor.pow(vec3(2.2)).mul(dotNL).toVar('diffuse')
        const fresnel = viewDir.dot(outwardNormal).oneMinus().max(0).toVar('fresnel')
        const fresnelFactor = fresnel.pow(metallic.mul(1.5).add(3.5)).toVar('fresnelFactor')
        const reflection = baseColor.mul(fresnelFactor).toVar('reflection')
        return diffuse.mul(fresnelFactor.oneMinus()).add(reflection).add(vec3(specular)).add(vec3(ambient)).min(vec3(1))
})

const fragment = Fn(([position = vec4()]) => {
        const cr = cameraRotation.cos().toVar('cr')
        const sr = cameraRotation.sin().toVar('sr')
        // prettier-ignore
        const mat = mat3(
                cr.y,           0,             sr.y.negate(),
                sr.x.mul(sr.y), cr.x,          cr.y.mul(sr.x),
                cr.x.mul(sr.y), sr.x.negate(), cr.x.mul(cr.y)
        ).toVar('mat')
        const ro = mat.mul(cameraPosition).toVar('camPos')
        const fov = radians(50).mul(0.5).tan().toVec2().toVar('fov')
        fov.x.assign(fov.x.mul(iResolution.x.div(iResolution.y)))
        const coord = position.xy.div(iResolution.xy).mul(2).sub(1).toVar('coord')
        const vDir = vec3(coord.mul(fov), -1).normalize().toVar('vDir')
        const rd = mat.mul(vDir).toVar('rd')
        const ray = harnack(ro, rd)
        const light = intersectSphere(ro, rd, lightPosition, lightScale)
        If(light.hit.and(ray.hit.not().or(light.t.lessThan(ray.t))), () => {
                return vec4(1)
        })
        If(ray.hit, () => {
                const nor = ray.n.normalize()
                const hitPos = ray.t.mul(rd).add(ro)
                const shadedColor = shade(hitPos, rd, nor)
                return vec4(shadedColor.pow(vec3(1 / 2.2)), 1)
        })

        return vec4(0)
})

export default function App() {
        const drag = useDrag(() => {
                update()
        })
        const update = () => {
                const [x, y] = drag.offset
                const rotX = y / 100
                const rotY = x / 100
                cameraRotation.value = [-rotX, -rotY]
        }
        const gl = useGL({
                fs: fragment(position),
                loop() {
                        drag.offset[0] += 0.1
                        update()
                },
        })
        gl.uniform(
                useControls({
                        thickness: { value: 0, min: 0, max: 2 },
                        ambient: { value: 0.1, min: 0, max: 1 },
                        metallic: { value: 1, min: 0, max: 1 },
                        roughness: { value: 0.7, min: 0, max: 1 },
                        scale: { value: 4, min: 0, max: 10 },
                        radius: { value: 1, min: 0, max: 2 },
                        unitShift: { value: 3, min: 0, max: 10 },
                        baseColor: [0.8, 0.7, 0.8],
                        cameraPosition: [0, 0, 3],
                })
        )

        return (
                <div ref={drag.ref} style={{ position: 'fixed', top: 0, left: 0, touchAction: 'none' }}>
                        <canvas ref={gl.ref} />
                </div>
        )
}
