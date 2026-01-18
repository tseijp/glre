import Layout from '@theme/Layout'
import { useGL } from 'glre/src/react'
import { Float, Fn, If, Loop, float, int, iDrag, iTime, ivec3, mat3, Scope, vec3, vec4, uv } from 'glre/src/node'
import { rotate3dX, rotate3dY } from 'glre/src/addons'
import type { Int, Vec3, Vec4 } from 'glre/src/node'

const MAX_ORDER = 1

const hilbert3 = Fn(([index, order]: [Int, Int]): Vec3 => {
        const p = ivec3(0).toVar()
        const bit = int(0).toVar()
        Loop(order, () => {
                const base = bit.mul(int(3)).toVar()
                p.addAssign(ivec3(index).shiftRight(ivec3(2, 1, 0).add(base)).bitAnd(ivec3(1)).shiftLeft(ivec3(bit)))
                bit.addAssign(int(1))
        })
        p.assign(p.bitXor(ivec3(p.z.shiftRight(int(1)), p.x, p.y)))
        const q = int(2).toVar()
        Loop(order.sub(int(1)), () => {
                const mask = q.sub(int(1)).toVar()
                const pq = p.bitAnd(ivec3(q)).toVar()
                If(pq.z.equal(int(q)), () => void p.x.bitXorAssign(mask))
                If(pq.z.equal(int(0)), () => void p.bitXorAssign(ivec3(p.x.bitXor(p.z).bitAnd(mask)).xzy))
                If(pq.y.equal(int(q)), () => void p.x.bitXorAssign(mask))
                If(pq.y.equal(int(0)), () => void p.bitXorAssign(ivec3(p.x.bitXor(p.y).bitAnd(mask)).xyy))
                If(pq.x.equal(int(q)), () => void p.x.bitXorAssign(mask))
                q.shiftLeftAssign(int(1))
        })
        return vec3(p)
})

const segment = Fn(([p, a, b]: [Vec3, Vec3, Vec3]) => {
        const pa = p.sub(a).toVar()
        const ba = b.sub(a).toVar()
        return pa.sub(ba.mul(pa.dot(ba).div(ba.dot(ba)).clamp(0, 1))).length()
})

const hilbertSDF = Fn(([p, order]: [Vec3, Int]): Float => {
        const scale = (v: Vec3) => v.div(n1f).mul(2).sub(1)
        const n1f = int(1).shiftLeft(order).sub(int(1)).toFloat().toVar()
        const d = float(1e6).toVar()
        const i = int(0).toVar()
        const a = scale(hilbert3(i, order)).toVar()
        Loop(int(1).shiftLeft(int(3).mul(order)).sub(int(1)), () => {
                i.addAssign(int(1))
                const b = scale(hilbert3(i, order)).toVar()
                d.assign(d.min(segment(p, a, b).sub(float(0.035))))
                a.assign(b)
        })
        return d
})

export const fragment = Scope<Vec4>(() => {
        const eps = vec3(0.002, 0, 0)
        const eye = rotate3dX(iDrag.y.negate()).mul(rotate3dY(iDrag.x.negate())).mul(vec3(0, 0, 5))
        const order = int(iTime.mod(MAX_ORDER).add(1))
        const march = Fn(([eye, dir]: [Vec3, Vec3]): Vec3 => {
                const p = eye.toVar()
                const d = hilbertSDF(p, order).toVar()
                const totalD = float(0).toVar()
                Loop(32, () => {
                        If(d.lessThanEqual(eps.x), () =>
                                vec3(hilbertSDF(p.add(eps.xyy), order).sub(d), hilbertSDF(p.add(eps.yxy), order).sub(d), hilbertSDF(p.add(eps.yyx), order).sub(d))
                                        .normalize()
                                        .mul(0.5)
                                        .add(0.5)
                                        .mul(vec3(0.2, 0.7, 0.95))
                        )
                        If(totalD.greaterThan(float(10)), () => vec3(0))
                        p.addAssign(d.mul(dir))
                        totalD.addAssign(d)
                        d.assign(hilbertSDF(p, order))
                })
                return vec3(0)
        })
        const z = eye.negate().normalize()
        const x = z.cross(vec3(0, 1, 0)).normalize()
        const y = x.cross(z)
        const dir = mat3(x, y, z)
                .mul(vec3(uv.sub(float(0.5)), 1.6))
                .normalize()
        return vec4(march(eye, dir), 1)
})

export default () => (
        <Layout noFooter>
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%' }}>
                        <canvas ref={useGL({ fragment }).ref} />
                </div>
        </Layout>
)
