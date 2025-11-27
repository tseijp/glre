import { Fn, Float, Vec2, Vec3, Vec4, vec2, vec3, vec4, float } from '../../node'
import { mod289Vec2, mod289Vec3, mod289Vec4 } from '../math/mod289'
import { permute, permuteVec3, permuteVec4 } from '../math/permute'
import { taylorInvSqrt } from '../math/taylorInvSqrt'
import { grad4 } from '../math/grad4'

export const snoiseVec2 = Fn(([v]: [Vec2]): Float => {
        const C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439).toVar('C')
        const i = v.add(v.dot(C.yy)).floor().toVar('i')
        const x0 = v.sub(i).add(i.dot(C.xx)).toVar('x0')
        const i1 = vec2(1, 0).select(vec2(0, 1), x0.x.greaterThan(x0.y)).toVar('i1')
        const x12 = x0.xyxy.add(C.xxzz).toVar('x12')
        x12.xy = x12.xy.sub(i1)
        i.assign(mod289Vec2(i))
        const p = permuteVec3(
                permuteVec3(i.y.add(vec3(0, i1.y, 1)))
                        .add(i.x)
                        .add(vec3(0, i1.x, 1))
        ).toVar('p')
        const m = float(0.5)
                .sub(vec3(x0.dot(x0), x12.xy.dot(x12.xy), x12.zw.dot(x12.zw)))
                .max(0)
                .toVar('m')
        m.assign(m.mul(m))
        m.assign(m.mul(m))
        const x = p.mul(C.www).fract().mul(2).sub(1).toVar('x')
        const h = x.abs().sub(0.5).toVar('h')
        const ox = x.add(0.5).floor().toVar('ox')
        const a0 = x.sub(ox).toVar('a0')
        m.mulAssign(float(1.79284291400159).sub(float(0.85373472095314).mul(a0.mul(a0).add(h.mul(h)))))
        const g = vec3(a0.x.mul(x0.x).add(h.x.mul(x0.y)), a0.yz.mul(x12.xz).add(h.yz.mul(x12.yw))).toVar('g')
        return float(130).mul(m.dot(g))
}).setLayout({
        name: 'snoiseVec2',
        type: 'float',
        inputs: [{ name: 'v', type: 'vec2' }],
})

export const snoiseVec3 = Fn(([v]: [Vec3]): Float => {
        const C = vec2(1 / 6, 1 / 3).toVar('C')
        const D = vec4(0, 0.5, 1, 2).toVar('D')
        const i = v.add(v.dot(C.yyy)).floor().toVar('i')
        const x0 = v.sub(i).add(i.dot(C.xxx)).toVar('x0')
        const g = x0.yzx.step(x0.xyz).toVar('g')
        const l = float(1).sub(g).toVar('l')
        const i1 = g.xyz.min(l.zxy).toVar('i1')
        const i2 = g.xyz.max(l.zxy).toVar('i2')
        const x1 = x0.sub(i1).add(C.xxx).toVar('x1')
        const x2 = x0.sub(i2).add(C.yyy).toVar('x2')
        const x3 = x0.sub(D.yyy).toVar('x3')
        i.assign(mod289Vec3(i))
        const p = permuteVec4(
                permuteVec4(
                        permuteVec4(i.z.add(vec4(0, i1.z, i2.z, 1)))
                                .add(i.y)
                                .add(vec4(0, i1.y, i2.y, 1))
                )
                        .add(i.x)
                        .add(vec4(0, i1.x, i2.x, 1))
        ).toVar('p')
        const n_ = float(0.142857142857).toVar('n_')
        const ns = n_.mul(D.wyz).sub(D.xzx).toVar('ns')
        const j = p.sub(p.mul(ns.z).mul(ns.z).floor().mul(49)).toVar('j')
        const x_ = j.mul(ns.z).floor().toVar('x_')
        const y_ = j.sub(x_.mul(7)).floor().toVar('y_')
        const x = x_.mul(ns.x).add(ns.yyyy).toVar('x')
        const y = y_.mul(ns.x).add(ns.yyyy).toVar('y')
        const h = float(1).sub(x.abs()).sub(y.abs()).toVar('h')
        const b0 = vec4(x.xy, y.xy).toVar('b0')
        const b1 = vec4(x.zw, y.zw).toVar('b1')
        const s0 = b0.floor().mul(2).add(1).toVar('s0')
        const s1 = b1.floor().mul(2).add(1).toVar('s1')
        const sh = vec4(0).step(h).negate().toVar('sh')
        const a0 = b0.xzyw.add(s0.xzyw.mul(sh.xxyy)).toVar('a0')
        const a1 = b1.xzyw.add(s1.xzyw.mul(sh.zzww)).toVar('a1')
        const p0 = vec3(a0.xy, h.x).toVar('p0')
        const p1 = vec3(a0.zw, h.y).toVar('p1')
        const p2 = vec3(a1.xy, h.z).toVar('p2')
        const p3 = vec3(a1.zw, h.w).toVar('p3')
        const norm = taylorInvSqrt(vec4(p0.dot(p0), p1.dot(p1), p2.dot(p2), p3.dot(p3))).toVar('norm')
        p1.mulAssign(norm.y)
        p2.mulAssign(norm.z)
        p3.mulAssign(norm.w)
        const m = float(0.6)
                .sub(vec4(x0.dot(x0), x1.dot(x1), x2.dot(x2), x3.dot(x3)))
                .max(0)
                .toVar('m')
        m.assign(m.mul(m))
        return float(42).mul(m.mul(m).dot(vec4(p0.dot(x0), p1.dot(x1), p2.dot(x2), p3.dot(x3))))
}).setLayout({
        name: 'snoiseVec3',
        type: 'float',
        inputs: [{ name: 'v', type: 'vec3' }],
})

export const snoiseVec4 = Fn(([v]: [Vec4]): Float => {
        const C = vec4(0.138196601125011, 0.276393202250021, 0.414589803375032, -0.447213595499958).toVar('C')
        const i = v
                .add(v.dot(vec4(0.309016994374947451)))
                .floor()
                .toVar('i')
        const x0 = v.sub(i).add(i.dot(C.xxxx)).toVar('x0')
        const i0 = vec4(0).toVar('i0')
        const isX = x0.xxx.step(x0.yzw).toVar('isX')
        const isYZ = x0.yyz.step(x0.zww).toVar('isYZ')
        i0.x = isX.x.add(isX.y).add(isX.z)
        i0.yzw = float(1).sub(isX)
        i0.y = i0.y.add(isYZ.x).add(isYZ.y)
        i0.zw = i0.zw.add(float(1).sub(isYZ.xy))
        i0.z = i0.z.add(isYZ.z)
        i0.w = i0.w.add(float(1).sub(isYZ.z))
        const i3 = i0.clamp(0, 1).toVar('i3')
        const i2 = i0.sub(1).clamp(0, 1).toVar('i2')
        const i1 = i0.sub(2).clamp(0, 1).toVar('i1')
        const x1 = x0.sub(i1).add(C.xxxx).toVar('x1')
        const x2 = x0.sub(i2).add(C.yyyy).toVar('x2')
        const x3 = x0.sub(i3).add(C.zzzz).toVar('x3')
        const x4 = x0.add(C.wwww).toVar('x4')
        i.assign(mod289Vec4(i))
        const j0 = permute(permute(permute(permute(i.w).add(i.z)).add(i.y)).add(i.x)).toVar('j0')
        const j1 = permuteVec4(
                permuteVec4(
                        permuteVec4(
                                permuteVec4(i.w.add(vec4(i1.w, i2.w, i3.w, 1)))
                                        .add(i.z)
                                        .add(vec4(i1.z, i2.z, i3.z, 1))
                        )
                                .add(i.y)
                                .add(vec4(i1.y, i2.y, i3.y, 1))
                )
                        .add(i.x)
                        .add(vec4(i1.x, i2.x, i3.x, 1))
        ).toVar('j1')
        const ip = vec4(1 / 294, 1 / 49, 1 / 7, 0).toVar('ip')
        const p0 = grad4(j0, ip).toVar('p0')
        const p1 = grad4(j1.x, ip).toVar('p1')
        const p2 = grad4(j1.y, ip).toVar('p2')
        const p3 = grad4(j1.z, ip).toVar('p3')
        const p4 = grad4(j1.w, ip).toVar('p4')
        const norm = taylorInvSqrt(vec4(p0.dot(p0), p1.dot(p1), p2.dot(p2), p3.dot(p3))).toVar('norm')
        p0.mulAssign(norm.x)
        p1.mulAssign(norm.y)
        p2.mulAssign(norm.z)
        p3.mulAssign(norm.w)
        p4.mulAssign(taylorInvSqrt(p4.dot(p4)))
        const m0 = float(0.6)
                .sub(vec3(x0.dot(x0), x1.dot(x1), x2.dot(x2)))
                .max(0)
                .toVar('m0')
        const m1 = float(0.6)
                .sub(vec2(x3.dot(x3), x4.dot(x4)))
                .max(0)
                .toVar('m1')
        m0.assign(m0.mul(m0))
        m1.assign(m1.mul(m1))
        return float(49).mul(
                m0
                        .mul(m0)
                        .dot(vec3(p0.dot(x0), p1.dot(x1), p2.dot(x2)))
                        .add(m1.mul(m1).dot(vec2(p3.dot(x3), p4.dot(x4))))
        )
}).setLayout({
        name: 'snoiseVec4',
        type: 'float',
        inputs: [{ name: 'v', type: 'vec4' }],
})

export const snoise2 = Fn(([x]: [Vec2]): Vec2 => {
        const s = snoiseVec2(x).toVar('s')
        const s1 = snoiseVec2(vec2(x.y.sub(19.1), x.x.add(47.2))).toVar('s1')
        return vec2(s, s1)
}).setLayout({
        name: 'snoise2',
        type: 'vec2',
        inputs: [{ name: 'x', type: 'vec2' }],
})

export const snoise3Vec3 = Fn(([x]: [Vec3]): Vec3 => {
        const s = snoiseVec3(x).toVar('s')
        const s1 = snoiseVec3(vec3(x.y.sub(19.1), x.z.add(33.4), x.x.add(47.2))).toVar('s1')
        const s2 = snoiseVec3(vec3(x.z.add(74.2), x.x.sub(124.5), x.y.add(99.4))).toVar('s2')
        return vec3(s, s1, s2)
}).setLayout({
        name: 'snoise3Vec3',
        type: 'vec3',
        inputs: [{ name: 'x', type: 'vec3' }],
})

export const snoise3Vec4 = Fn(([x]: [Vec4]): Vec3 => {
        const s = snoiseVec4(x).toVar('s')
        const s1 = snoiseVec4(vec4(x.y.sub(19.1), x.z.add(33.4), x.x.add(47.2), x.w)).toVar('s1')
        const s2 = snoiseVec4(vec4(x.z.add(74.2), x.x.sub(124.5), x.y.add(99.4), x.w)).toVar('s2')
        return vec3(s, s1, s2)
}).setLayout({
        name: 'snoise3Vec4',
        type: 'vec3',
        inputs: [{ name: 'x', type: 'vec4' }],
})
