import { Fn, Float, Vec2, Vec3, vec2, vec3, vec4, mat3, step, floor, fract, mix, If, float, any } from '../../node'
import { mod289Vec3 } from '../math/mod289'
import { permuteVec4 } from '../math/permute'

// Basic psrdnoise 2D implementation
export const psrdnoise2D = Fn(([x, period, alpha]: [Vec2, Vec2, Float]): Vec2 => {
        const uv = vec2(x.x.add(x.y.mul(0.5)), x.y).toVar('uv')
        const i0 = floor(uv).toVar('i0')
        const f0 = fract(uv).toVar('f0')
        const cmp = step(f0.y, f0.x).toVar('cmp')
        const o1 = vec2(cmp, cmp.oneMinus()).toVar('o1')
        const i1 = i0.add(o1).toVar('i1')
        const i2 = i0.add(vec2(1, 1)).toVar('i2')

        const v0 = vec2(i0.x.sub(i0.y.mul(0.5)), i0.y).toVar('v0')
        const v1 = vec2(v0.x.add(o1.x).sub(o1.y.mul(0.5)), v0.y.add(o1.y)).toVar('v1')
        const v2 = vec2(v0.x.add(0.5), v0.y.add(1)).toVar('v2')

        const x0 = x.sub(v0).toVar('x0')
        const x1 = x.sub(v1).toVar('x1')
        const x2 = x.sub(v2).toVar('x2')

        let iu = vec3(i0.x, i1.x, i2.x).toVar('iu')
        let iv = vec3(i0.y, i1.y, i2.y).toVar('iv')

        If(period.x.greaterThan(0).or(period.y.greaterThan(0)), () => {
                const xw = vec3(v0.x, v1.x, v2.x).toVar('xw')
                const yw = vec3(v0.y, v1.y, v2.y).toVar('yw')

                If(period.x.greaterThan(0), () => {
                        xw.assign(xw.mod(period.x))
                })

                If(period.y.greaterThan(0), () => {
                        yw.assign(yw.mod(period.y))
                })

                iu.assign(floor(xw.add(yw.mul(0.5)).add(0.5)))
                iv.assign(floor(yw.add(0.5)))
        })

        let hash = mod289Vec3(iu).toVar('hash')
        hash.assign(mod289Vec3(hash.mul(51).add(2).mul(hash).add(iv)))
        hash.assign(mod289Vec3(hash.mul(34).add(10).mul(hash)))

        const psi = hash.mul(0.07482).add(alpha).toVar('psi')
        const gx = psi.cos().toVar('gx')
        const gy = psi.sin().toVar('gy')

        const g0 = vec2(gx.x, gy.x).toVar('g0')
        const g1 = vec2(gx.y, gy.y).toVar('g1')
        const g2 = vec2(gx.z, gy.z).toVar('g2')

        const w = vec3(0.8)
                .sub(vec3(x0.dot(x0), x1.dot(x1), x2.dot(x2)))
                .toVar('w')
        w.assign(w.max(0))

        const w2 = w.mul(w).toVar('w2')
        const w4 = w2.mul(w2).toVar('w4')
        const gdotx = vec3(g0.dot(x0), g1.dot(x1), g2.dot(x2)).toVar('gdotx')
        const n = w4.dot(gdotx).toVar('n')

        const w3 = w2.mul(w).toVar('w3')
        const dw = w3.mul(-8).mul(gdotx).toVar('dw')
        const dn0 = g0.mul(w4.x).add(x0.mul(dw.x)).toVar('dn0')
        const dn1 = g1.mul(w4.y).add(x1.mul(dw.y)).toVar('dn1')
        const dn2 = g2.mul(w4.z).add(x2.mul(dw.z)).toVar('dn2')
        const gradient = dn0.add(dn1).add(dn2).mul(10.9).toVar('gradient')

        return vec2(n.mul(10.9), gradient.length())
}).setLayout({
        name: 'psrdnoise2D',
        type: 'vec2',
        inputs: [
                { name: 'x', type: 'vec2' },
                { name: 'period', type: 'vec2' },
                { name: 'alpha', type: 'float' },
        ],
})

// Basic psrdnoise 3D implementation
export const psrdnoise3D = Fn(([x, period, alpha]: [Vec3, Vec3, Float]): Vec3 => {
        const M = mat3(0, 1, 1, 1, 0, 1, 1, 1, 0).toVar('M')
        const Mi = mat3(-0.5, 0.5, 0.5, 0.5, -0.5, 0.5, 0.5, 0.5, -0.5).toVar('Mi')

        const uvw = M.mul(x).toVar('uvw')
        const i0 = floor(uvw).toVar('i0')
        const f0 = fract(uvw).toVar('f0')

        const g_ = step(f0.xyx, f0.yzz).toVar('g_')
        const l_ = g_.oneMinus().toVar('l_')
        const g = vec3(l_.z, g_.xy).toVar('g')
        const l = vec3(l_.xy, g_.z).toVar('l')

        const o1 = g.min(l).toVar('o1')
        const o2 = g.max(l).toVar('o2')

        const i1 = i0.add(o1).toVar('i1')
        const i2 = i0.add(o2).toVar('i2')
        const i3 = i0.add(vec3(1)).toVar('i3')

        let v0 = Mi.mul(i0).toVar('v0')
        let v1 = Mi.mul(i1).toVar('v1')
        let v2 = Mi.mul(i2).toVar('v2')
        let v3 = Mi.mul(i3).toVar('v3')

        const x0 = x.sub(v0).toVar('x0')
        const x1 = x.sub(v1).toVar('x1')
        const x2 = x.sub(v2).toVar('x2')
        const x3 = x.sub(v3).toVar('x3')

        If(period.x.greaterThan(0).or(period.y.greaterThan(0)).or(period.z.greaterThan(0)), () => {
                const vx = vec4(v0.x, v1.x, v2.x, v3.x).toVar('vx')
                const vy = vec4(v0.y, v1.y, v2.y, v3.y).toVar('vy')
                const vz = vec4(v0.z, v1.z, v2.z, v3.z).toVar('vz')

                If(period.x.greaterThan(0), () => vx.assign(vx.mod(period.x)))
                If(period.y.greaterThan(0), () => vy.assign(vy.mod(period.y)))
                If(period.z.greaterThan(0), () => vz.assign(vz.mod(period.z)))

                i0.assign(M.mul(vec3(vx.x, vy.x, vz.x)))
                i1.assign(M.mul(vec3(vx.y, vy.y, vz.y)))
                i2.assign(M.mul(vec3(vx.z, vy.z, vz.z)))
                i3.assign(M.mul(vec3(vx.w, vy.w, vz.w)))

                i0.assign(floor(i0.add(0.5)))
                i1.assign(floor(i1.add(0.5)))
                i2.assign(floor(i2.add(0.5)))
                i3.assign(floor(i3.add(0.5)))
        })

        const hash = permuteVec4(
                permuteVec4(permuteVec4(vec4(i0.z, i1.z, i2.z, i3.z)).add(vec4(i0.y, i1.y, i2.y, i3.y))).add(
                        vec4(i0.x, i1.x, i2.x, i3.x)
                )
        ).toVar('hash')

        const theta = hash.mul(3.883222077).toVar('theta')
        const sz = hash.mul(-0.006920415).add(0.996539792).toVar('sz')
        const psi = hash.mul(0.108705628).toVar('psi')

        const Ct = theta.cos().toVar('Ct')
        const St = theta.sin().toVar('St')
        const sz_prime = sz.mul(sz).oneMinus().sqrt().toVar('sz_prime')

        const gx = Ct.mul(sz_prime).toVar('gx')
        const gy = St.mul(sz_prime).toVar('gy')
        const gz = sz.toVar('gz')

        If(alpha.notEqual(0), () => {
                const Sp = psi.sin().toVar('Sp')
                const Cp = psi.cos().toVar('Cp')
                const px = Ct.mul(sz_prime).toVar('px')
                const py = St.mul(sz_prime).toVar('py')
                const pz = sz.toVar('pz')

                const Ctp = St.mul(Sp).sub(Ct.mul(Cp)).toVar('Ctp')
                const qx = mix(Ctp.mul(St), Sp, sz).toVar('qx')
                const qy = mix(Ctp.negate().mul(Ct), Cp, sz).toVar('qy')
                const qz = py.mul(Cp).add(px.mul(Sp)).negate().toVar('qz')

                const Sa = vec4(alpha.sin()).toVar('Sa')
                const Ca = vec4(alpha.cos()).toVar('Ca')

                gx.assign(Ca.mul(px).add(Sa.mul(qx)))
                gy.assign(Ca.mul(py).add(Sa.mul(qy)))
                gz.assign(Ca.mul(pz).add(Sa.mul(qz)))
        })

        const g0 = vec3(gx.x, gy.x, gz.x).toVar('g0')
        const g1 = vec3(gx.y, gy.y, gz.y).toVar('g1')
        const g2 = vec3(gx.z, gy.z, gz.z).toVar('g2')
        const g3 = vec3(gx.w, gy.w, gz.w).toVar('g3')

        let w = vec4(0.5)
                .sub(vec4(x0.dot(x0), x1.dot(x1), x2.dot(x2), x3.dot(x3)))
                .toVar('w')
        w.assign(w.max(0))

        const w2 = w.mul(w).toVar('w2')
        const w3 = w2.mul(w).toVar('w3')
        const gdotx = vec4(g0.dot(x0), g1.dot(x1), g2.dot(x2), g3.dot(x3)).toVar('gdotx')
        const n = w3.dot(gdotx).toVar('n')

        const dw = w2.mul(-6).mul(gdotx).toVar('dw')
        const dn0 = g0.mul(w3.x).add(x0.mul(dw.x)).toVar('dn0')
        const dn1 = g1.mul(w3.y).add(x1.mul(dw.y)).toVar('dn1')
        const dn2 = g2.mul(w3.z).add(x2.mul(dw.z)).toVar('dn2')
        const dn3 = g3.mul(w3.w).add(x3.mul(dw.w)).toVar('dn3')
        const gradient = dn0.add(dn1).add(dn2).add(dn3).mul(39.5).toVar('gradient')

        return vec3(n.mul(39.5), gradient.xy)
}).setLayout({
        name: 'psrdnoise3D',
        type: 'vec3',
        inputs: [
                { name: 'x', type: 'vec3' },
                { name: 'period', type: 'vec3' },
                { name: 'alpha', type: 'float' },
        ],
})

// Simplified overloads
export const psrdnoise = Fn(([x]: [Vec2]): Float => {
        return psrdnoise2D(x, vec2(0), float(0)).x
}).setLayout({
        name: 'psrdnoise',
        type: 'float',
        inputs: [{ name: 'x', type: 'vec2' }],
})

// Two-parameter overload for compatibility
export const psrdnoise2 = Fn(([x, period]: [Vec2, Vec2]): Float => {
        return psrdnoise2D(x, period, float(0)).x
}).setLayout({
        name: 'psrdnoise2',
        type: 'float',
        inputs: [
                { name: 'x', type: 'vec2' },
                { name: 'period', type: 'vec2' },
        ],
})

export const psrdnoisePeriod = Fn(([x, period]: [Vec2, Vec2]): Float => {
        return psrdnoise2D(x, period, float(0)).x
}).setLayout({
        name: 'psrdnoisePeriod',
        type: 'float',
        inputs: [
                { name: 'x', type: 'vec2' },
                { name: 'period', type: 'vec2' },
        ],
})

export const psrdnoiseAlpha = Fn(([x, period, alpha]: [Vec2, Vec2, Float]): Float => {
        return psrdnoise2D(x, period, alpha).x
}).setLayout({
        name: 'psrdnoiseAlpha',
        type: 'float',
        inputs: [
                { name: 'x', type: 'vec2' },
                { name: 'period', type: 'vec2' },
                { name: 'alpha', type: 'float' },
        ],
})

export const psrdnoise3 = Fn(([x]: [Vec3]): Float => {
        return psrdnoise3D(x, vec3(0), float(0)).x
}).setLayout({
        name: 'psrdnoise3',
        type: 'float',
        inputs: [{ name: 'x', type: 'vec3' }],
})

export const psrdnoise3Period = Fn(([x, period]: [Vec3, Vec3]): Float => {
        return psrdnoise3D(x, period, float(0)).x
}).setLayout({
        name: 'psrdnoise3Period',
        type: 'float',
        inputs: [
                { name: 'x', type: 'vec3' },
                { name: 'period', type: 'vec3' },
        ],
})

export const psrdnoise3Alpha = Fn(([x, period, alpha]: [Vec3, Vec3, Float]): Float => {
        return psrdnoise3D(x, period, alpha).x
}).setLayout({
        name: 'psrdnoise3Alpha',
        type: 'float',
        inputs: [
                { name: 'x', type: 'vec3' },
                { name: 'period', type: 'vec3' },
                { name: 'alpha', type: 'float' },
        ],
})
