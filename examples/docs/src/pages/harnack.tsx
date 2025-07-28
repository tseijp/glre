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
        select,
        position,
        abs,
        length,
        tan,
        normalize,
        dot,
        exp,
        If,
        uniform,
} from 'glre/src/react'

// Constants matching original shader
const PI = constant(3.14159265358979323846)
const epsilon = constant(0.025)
const max_iterations = int(2500)
const animation_speed = constant(0.0)
const unit_shift = constant(3.0)
const fill_material = constant(false)
const wall_thickness = constant(0.1)
const scale = constant(9.0)
const use_grad_termination = constant(true)
const clip_to_sphere = constant(true)
const sphereCenter = vec3(0.0, 0.0, 0.0)
const sphereRadius = constant(1.0)
const outerRadius = sphereRadius.add(0.5)
const draw_ground_plane = constant(true)
const light = vec3(2.0, 10.0, 1.0)
const groundNormal = normalize(vec3(0.0, 1.0, 0.0))
const groundLevel = constant(-1.0)

// Camera input uniforms (simulating iChannel0 buffer)
const camRot = uniform([0.0, 0.0], 'camRot')
const camPosD = uniform([0.0, 0.0, 0.0, 3.0], 'camPosD')

// Sphere intersection function - fixed types completely
const intersectSphere = Fn(([ro, rd, center, radius]) => {
        const oc = ro.sub(center).toVar('oc')
        const a = dot(rd, rd).toVar('a')
        const b = float(2.0).mul(dot(oc, rd)).toVar('b')
        const c = dot(oc, oc).sub(radius.mul(radius)).toVar('c')
        const discr = b.mul(b).sub(float(4.0).mul(a).mul(c)).toVar('discr')

        const t0 = float(-1.0).toVar('t0')
        const t1 = float(-1.0).toVar('t1')
        const hasHit = bool(false).toVar('hasHit')

        If(discr.greaterThanEqual(0.0), () => {
                const sqrtDiscr = sqrt(discr).toVar('sqrtDiscr')
                const q = float(0.0).toVar('q')

                If(b.greaterThan(0.0), () => {
                        q.assign(float(-0.5).mul(b.add(sqrtDiscr)))
                })
                If(b.lessThanEqual(0.0), () => {
                        q.assign(float(-0.5).mul(b.sub(sqrtDiscr)))
                })

                t0.assign(q.div(a))
                t1.assign(c.div(q))

                If(t1.lessThan(t0), () => {
                        const temp = t0.toVar('temp')
                        t0.assign(t1)
                        t1.assign(temp)
                })

                hasHit.assign(bool(true))
        })

        return vec4(t0, t1, select(float(1.0), float(0.0), hasHit), 0.0)
})

// Plane intersection
const intersectPlane = Fn(([ro, rd, n, d]) => {
        const denom = dot(n, rd).toVar('denom')
        const t = d.sub(dot(n, ro)).div(denom).toVar('t')
        const validHit = dot(rd, n).lessThan(0.0).and(t.greaterThanEqual(0.0))
        return vec2(t, select(float(1.0), float(0.0), validHit))
})

const getRadius = Fn(([p]) => {
        return outerRadius.sub(length(p))
}).setLayout({ name: 'getRadius', type: 'float', inputs: [{ name: 'p', type: 'vec3' }] })

// Gyroid function exactly matching original
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

// Gradient function exactly matching original
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

// Level set proximity checks
const closeToLevelset = Fn(([f, levelset, tol, gradNorm]) => {
        const eps = select(tol.mul(gradNorm), tol, use_grad_termination)
        return abs(f.sub(levelset)).lessThan(eps)
})

const betweenLevelsets = Fn(([f, loBound, hiBound, tol, gradNorm]) => {
        const eps = select(tol.mul(gradNorm), tol, use_grad_termination)
        return max(loBound.sub(f), f.sub(hiBound)).lessThan(eps)
})

// 4D max step calculation for Harnack algorithm
const getMaxStep4D = Fn(([fx, R, levelset, shift]) => {
        const a = fx.add(shift).div(levelset.add(shift)).toVar('a')
        const term1 = float(3.0)
                .mul(
                        sqrt(
                                float(3.0)
                                        .mul(pow(a, 3.0))
                                        .add(float(81.0).mul(pow(a, 2.0)))
                        )
                )
                .toVar('term1')
        const term2 = float(27.0).mul(a).toVar('term2')
        const u = pow(term1.add(term2), float(1.0).div(3.0)).toVar('u')
        const result = R.mul(abs(u.div(3.0).sub(a.div(u)).sub(1.0)))
        return result
})

// Simplified Harnack tracing - fixed all type issues
const harnack = Fn(([ro, rd, tmax]) => {
        const levelset = sin(animation_speed.mul(iTime)).toVar('levelset')
        const t = float(0.0).toVar('t')
        const pos = vec3(0.0).toVar('pos')
        const normal = vec3(0.0, 1.0, 0.0).toVar('normal')
        const foundHit = bool(false).toVar('foundHit')
        const iters = int(0).toVar('iters')

        const t0 = float(0.0).toVar('t0')
        const t1 = tmax.toVar('t1')

        // Sphere clipping - cache result
        const sphereResult = intersectSphere(ro, rd, sphereCenter, sphereRadius).toVar('sphereResult')

        If(clip_to_sphere, () => {
                const hitSphere = sphereResult.z.greaterThan(0.5)
                const sphereT0 = sphereResult.x
                const sphereT1 = sphereResult.y

                If(hitSphere.not().or(tmax.lessThan(0.0)), () => {
                        foundHit.assign(bool(false))
                        return
                })

                If(sphereT0.greaterThan(0.0), () => {
                        t.assign(sphereT0)
                        t0.assign(sphereT0)
                })

                If(sphereT1.lessThan(tmax), () => {
                        t1.assign(sphereT1)
                })

                // Check immediate intersection at sphere entry
                const entryPos = ro.add(rd.mul(t0)).toVar('entryPos')
                const val = gyroid(entryPos).toVar('val')
                const gradF = gradient(entryPos).toVar('gradF')
                const gradNorm = length(gradF).toVar('gradNorm')

                If(
                        betweenLevelsets(
                                val,
                                levelset.sub(wall_thickness),
                                levelset.add(wall_thickness),
                                epsilon,
                                gradNorm
                        ),
                        () => {
                                pos.assign(entryPos)
                                normal.assign(entryPos)
                                foundHit.assign(bool(true))
                                return
                        }
                )
        })

        t.assign(t0)
        pos.assign(ro.add(rd.mul(t)))

        // Check if starting inside material
        If(fill_material.and(gyroid(pos).lessThan(levelset)), () => {
                normal.assign(pos)
                foundHit.assign(bool(true))
                return
        })

        const t_overstep = float(0.0).toVar('t_overstep')

        // Main Harnack loop - simplified to avoid type errors
        Loop(max_iterations, () => {
                const shouldContinue = t.lessThan(t1).and(foundHit.not())

                If(shouldContinue.not(), () => {
                        return
                })

                iters.assign(iters.add(int(1)))

                If(iters.greaterThan(max_iterations), () => {
                        foundHit.assign(bool(false))
                        return
                })

                pos.assign(ro.add(rd.mul(t)).add(rd.mul(t_overstep)))

                const val = gyroid(pos).toVar('val')
                const gradF = gradient(pos).toVar('gradF')
                const gradNorm = length(gradF).toVar('gradNorm')

                // Thicken walls - proper conditional assignment
                const offset_levelset = float(0.0).toVar('offset_levelset')
                If(val.greaterThan(levelset.add(wall_thickness)), () => {
                        offset_levelset.assign(levelset.add(wall_thickness))
                })
                If(val.lessThan(levelset.sub(wall_thickness)), () => {
                        offset_levelset.assign(levelset.sub(wall_thickness))
                })
                If(
                        val
                                .greaterThanEqual(levelset.sub(wall_thickness))
                                .and(val.lessThanEqual(levelset.add(wall_thickness))),
                        () => {
                                offset_levelset.assign(levelset)
                        }
                )

                const R = getRadius(pos).toVar('R')
                const shift = exp(sqrt(float(2.0)).mul(R))
                        .mul(unit_shift)
                        .toVar('shift')
                const r = getMaxStep4D(val, R, offset_levelset, shift).toVar('r')

                // Check for intersection
                const validOverstep = r.greaterThanEqual(t_overstep)
                const closeToSurface = closeToLevelset(val, offset_levelset, epsilon, gradNorm)

                If(validOverstep.and(closeToSurface), () => {
                        normal.assign(gradF)
                        foundHit.assign(bool(true))
                        return
                })

                // Update step sizes - proper conditional assignment
                const stepSize = float(0.0).toVar('stepSize')
                const newOverstep = float(0.0).toVar('newOverstep')

                If(validOverstep, () => {
                        stepSize.assign(t_overstep.add(r))
                        newOverstep.assign(r.mul(0.75))
                })

                t.assign(t.add(stepSize))
                t_overstep.assign(newOverstep)
        })

        return vec4(pos, select(float(1.0), float(0.0), foundHit))
})

// Shading functions
const diffuseShade = Fn(([pos, normal, lightPos, materialColor]) => {
        const lightDir = normalize(lightPos.sub(pos))
        const diffuse = max(dot(lightDir, normal), 0.3)
        return materialColor.mul(diffuse)
})

const fresnelShade = Fn(([ray, normal]) => {
        const fresnel = pow(float(1.0).sub(abs(dot(ray, normal))), 4.0)
        return vec3(fresnel)
})

const shade = Fn(([pos, ray, normal, materialColor]) => {
        const diffuse = diffuseShade(pos, normal, light, materialColor)
        const fresnel = fresnelShade(ray, normal, materialColor)
        return min(diffuse.add(fresnel.mul(0.6)), vec3(1.0))
}).setLayout({
        name: 'shade',
        type: 'vec3',
        inputs: [
                { name: 'pos', type: 'vec3' },
                { name: 'ray', type: 'vec3' },
                { name: 'normal', type: 'vec3' },
                { name: 'materialColor', type: 'vec3' },
        ],
})

// Main fragment shader - avoid duplicate function calls
const fs = Fn(() => {
        const fragCoord = position.xy

        // Camera configuration matching original
        const cr = cos(camRot).toVar('cr')
        const sr = sin(camRot).toVar('sr')

        // View to world rotation matrix
        const v2wRotMat0 = vec3(cr.y, 0.0, sr.y.negate()).toVar('v2wRotMat0')
        const v2wRotMat1 = vec3(sr.x.mul(sr.y), cr.x, cr.y.mul(sr.x)).toVar('v2wRotMat1')
        const v2wRotMat2 = vec3(cr.x.mul(sr.y), sr.x.negate(), cr.x.mul(cr.y)).toVar('v2wRotMat2')

        const camPos = camPosD.xyz
                .add(v2wRotMat0.mul(0.0).add(v2wRotMat1.mul(0.0)).add(v2wRotMat2.mul(0.85).mul(camPosD.w)))
                .toVar('camPos')

        const fovY = constant(50.0)
        const tanHalfFov = tan(fovY.mul(PI).div(180.0).mul(0.5)).toVar('tanHalfFov')
        const tanHalfFovX = tanHalfFov.mul(iResolution.x.div(iResolution.y)).toVar('tanHalfFovX')

        const cCoord = fragCoord.div(iResolution.xy).mul(2.0).sub(1.0).toVar('cCoord')
        const vDir = normalize(vec3(cCoord.mul(vec2(tanHalfFovX, tanHalfFov)), -1.0)).toVar('vDir')

        // Transform view direction to world space
        const rd = v2wRotMat0.mul(vDir.x).add(v2wRotMat1.mul(vDir.y)).add(v2wRotMat2.mul(vDir.z)).toVar('rd')
        const ro = camPos

        // Main surface intersection - cache result
        const tmax = constant(10.0)
        const rayResult = harnack(ro, rd, tmax).toVar('rayResult')
        const didHit = rayResult.w.greaterThan(0.5)
        const hitPos = rayResult.xyz

        // Ground intersection
        const groundResult = intersectPlane(ro, rd, groundNormal, groundLevel).toVar('groundResult')
        const hitGround = draw_ground_plane.and(groundResult.y.greaterThan(0.5)).and(didHit.not())

        // Initialize color
        const col = vec3(1.0).toVar('col')

        // Surface shading
        If(didHit, () => {
                const hitNormal = normalize(gradient(hitPos))
                const baseColor = vec3(0.7, 0.6, 0.7)
                const outwardNormal = select(hitNormal.negate(), hitNormal, dot(hitNormal, rd).greaterThan(0.0))
                col.assign(shade(hitPos, rd, outwardNormal, baseColor))
        })

        // Ground shading
        If(hitGround, () => {
                col.assign(col.mul(0.8)) // Darken ground
        })

        // Gamma correction
        col.assign(sqrt(col))

        return vec4(col, 1.0)
})

const App = () => {
        const gl = useGL({
                width: 512,
                height: 512,
                fs: fs(),
        })
        return <canvas ref={gl.ref} />
}

export default App
