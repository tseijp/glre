import {
        constant,
        float,
        Fn,
        If,
        int,
        iResolution,
        Loop,
        mat3,
        position,
        sign,
        sqrt,
        uniform,
        useGL,
        vec2,
        vec3,
        vec4,
} from 'glre/src/react'
import { useDrag } from 'rege/react'

const epsilon = constant(0.025)
const iterations = constant(int(100))
const unit_shift = constant(3)
const scale = constant(10)
const sphereRadius = constant(1)
const fovY = constant(50)
const outerRadius = sphereRadius.add(0.5)
const lightPosition = vec3(2, 10, 1)
const cameraPosition = uniform([0, 0, 3])
const cameraRotation = uniform([0, 0])

const intersectSphere = Fn(([ro, rd, center, radius]) => {
        const a = rd.dot(rd).toVar('a')
        const b = rd.dot(ro.sub(center)).mul(2).toVar('b')
        const c = ro.sub(center).dot(ro.sub(center)).sub(radius.mul(radius)).toVar('c')
        const d = b.mul(b).sub(a.mul(c).mul(4)).toVar('d')
        If(d.lessThan(0), () => {
                return vec2(0, -1)
        })
        const q = sign(b).mul(d.sqrt()).add(b).mul(-0.5).toVar('q')
        const t0 = q.div(a).toVar('t0')
        const t1 = c.div(q).toVar('t1')
        If(t1.lessThan(t0), () => {
                return vec2(1, t1)
        })
        return vec2(1, t0)
})

const gyroid = Fn(([pos]) => {
        const p = pos.mul(scale).toVar('p')
        const s = p.sin().toVar('s')
        const c = p.cos().toVar('c')
        const val = s.x.mul(c.y).add(s.y.mul(c.z)).add(s.z.mul(c.x))
        const grad = vec3(
                c.x.mul(c.y).sub(s.z.mul(s.x)),
                c.y.mul(c.z).sub(s.x.mul(s.y)),
                c.z.mul(c.x).sub(s.y.mul(s.z))
        )
        return vec4(val, grad.mul(scale))
})

const getMaxStep4D = Fn(([fx, R]) => {
        const shift = sqrt(2).mul(R).exp().mul(unit_shift)
        const a = fx.add(shift).div(shift).toVar('a')
        const u = a.pow(3).mul(3).add(a.pow(2).mul(81)).sqrt().mul(3).add(a.mul(27)).pow(0.33333).toVar('u')
        return u.div(3).sub(a.div(u)).sub(1).abs().mul(R)
})

const harnack = Fn(([ro, rd]) => {
        const t = float(0).toVar('t')
        const sphere = intersectSphere(ro, rd, vec3(0, 0, 0), sphereRadius).toVar('sphere')
        If(sphere.x.lessThan(0.5), () => {
                return vec4(0, vec3(0))
        })
        t.assign(sphere.y.max(0))
        const pos = ro.add(t.mul(rd)).toVar('pos')
        const res = gyroid(pos).toVar('gyroidGradResult')
        const val = res.x.toVar('val')
        const grad = res.yzw.toVar('grad')
        If(val.abs().lessThan(epsilon.mul(grad.length())), () => {
                return vec4(t, grad)
        })
        const overstep = float(0).toVar('overstep')
        Loop(iterations, () => {
                pos.assign(ro.add(t.mul(rd)).add(overstep.mul(rd)))
                const result = gyroid(pos).toVar('result')
                val.assign(result.x)
                grad.assign(result.yzw)
                const R = outerRadius.sub(pos.length()).toVar('R')
                const r = getMaxStep4D(val, R).toVar('r')
                If(r.greaterThanEqual(overstep).and(val.abs().lessThan(epsilon.mul(grad.length()))), () => {
                        return vec4(t, grad)
                })
                const isValid = r.greaterThanEqual(overstep).toFloat().toVar('isValid')
                t.assign(t.add(isValid.mul(overstep.add(r))))
                overstep.assign(isValid.mul(r.mul(0.75)))
        })
        return vec4(0, vec3(0))
})

const shade = Fn(([pos, ray, normal, materialColor]) => {
        const lightDir = lightPosition.sub(pos).normalize()
        const viewDir = ray.negate()
        const halfVector = lightDir.add(viewDir).normalize()
        const dotNL = lightDir.dot(normal).max(0).toVar('dotNL')
        const dotLH = lightDir.dot(halfVector).max(0).toVar('dotLH')

        const dotLH5 = constant(1).sub(dotLH).pow(5).toVar('dotLH5')
        const F0 = constant(0.2)
        const F = F0.add(constant(1).sub(F0).mul(dotLH5)).toVar('F')

        const specular = F.mul(dotNL).toVar('specular')
        const diffuse = materialColor.mul(dotNL).toVar('diffuse')
        const fresnel = viewDir.dot(normal).abs().toVar('fresnel')
        const fresnelTerm = constant(1).sub(fresnel).pow(4).toVar('fresnelTerm')

        const ambient = materialColor.mul(0.3)
        const finalColor = diffuse
                .add(ambient)
                .add(specular.mul(vec3(1)).mul(0.5))
                .add(fresnelTerm.mul(vec3(1)).mul(0.2))

        return finalColor.min(vec3(1))
})

const fragment = Fn(([position]) => {
        const cr = cameraRotation.cos().toVar('cr')
        const sr = cameraRotation.sin().toVar('sr')
        // prettier-ignore
        const mat = mat3(
                cr.y,           0,             sr.y.negate(),
                sr.x.mul(sr.y), cr.x,          cr.y.mul(sr.x),
                cr.x.mul(sr.y), sr.x.negate(), cr.x.mul(cr.y)
        ).toVar('mat')
        const camPos = mat.mul(cameraPosition).toVar('camPos')
        const cCoord = position.xy.div(iResolution.xy).mul(2).sub(1).toVar('cCoord')
        cCoord.x.assign(cCoord.x.mul(iResolution.x.div(iResolution.y)))
        const rd = mat.mul(vec3(fovY.radians().mul(0.5).tan().mul(cCoord), -1)).toVar('rd')
        const result = harnack(camPos, rd).toVar('result')
        If(result.x.greaterThan(0.5), () => {
                const nor = result.yzw.normalize().toVar('nor')
                const dotProduct = nor.dot(rd).toVar('dotProduct')
                const flipSign = sign(dotProduct).toVar('flipSign')
                const finalNormal = nor.mul(flipSign.negate()).toVar('finalNormal')
                const hitPos = camPos.add(result.x.mul(rd)).toVar('hitPos')

                const lightDir = lightPosition.sub(hitPos).normalize().toVar('lightDir')
                const shadowRayOrigin = hitPos.add(lightDir.mul(0.05)).toVar('shadowRayOrigin')
                const lightDistance = lightPosition.sub(hitPos).length().toVar('lightDistance')
                const shadowResult = harnack(shadowRayOrigin, lightDir).toVar('shadowResult')
                const inShadow = shadowResult.x
                        .greaterThan(1)
                        .and(shadowResult.x.lessThan(lightDistance))
                        .toVar('inShadow')
                const materialColor = vec3(0.7, 0.6, 0.7)
                const shadedColor = shade(hitPos, rd, finalNormal, materialColor).toVar('shadedColor')
                const shadowFactor = inShadow.toFloat().mul(0.4).add(0.6).toVar('shadowFactor')
                const finalColor = shadedColor.mul(shadowFactor).toVar('finalColor')
                return vec4(finalColor.sqrt(), 1)
        })
        return vec4(1)
})

export default function App() {
        const update = () => (cameraRotation.value = [-drag.offset[1] / 200, -drag.offset[0] / 200])
        const drag = useDrag(update)
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
