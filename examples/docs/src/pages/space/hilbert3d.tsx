import Layout from '@theme/Layout'
import { useGL } from 'glre/src/react'
import { Float, Fn, If, Loop, float, int, iDrag, iTime, ivec3, mat3, Scope, vec3, vec4, uv } from 'glre/src/node'
import { rotate3dX, rotate3dY } from 'glre/src/addons'
import type { Int, Vec3, Vec4 } from 'glre/src/node'

const MAX_ORDER = 1

const segment = Fn(([p, a, b]: [Vec3, Vec3, Vec3]) => {
        const pa = p.sub(a).toVar()
        const ba = b.sub(a).toVar()
        return pa.sub(ba.mul(pa.dot(ba).div(ba.dot(ba)).clamp(0, 1))).length()
})

const hilbert3 = Fn(([index, order]: [Int, Int]): Vec3 => {
        const t = index.toVar()
        const p = ivec3(0).toVar()
        const bit = int(0).toVar()
        Loop(order, () => {
                const base = bit.mul(int(3)).toVar()
                p.x.addAssign(t.shiftRight(int(2).add(base)).bitAnd(int(1)).shiftLeft(bit))
                p.y.addAssign(t.shiftRight(int(1).add(base)).bitAnd(int(1)).shiftLeft(bit))
                p.z.addAssign(t.shiftRight(base).bitAnd(int(1)).shiftLeft(bit))
                bit.addAssign(int(1))
        })
        const t2 = p.z.shiftRight(int(1)).toVar()
        p.z.assign(p.z.bitXor(p.y))
        p.y.assign(p.y.bitXor(p.x))
        p.x.assign(p.x.bitXor(t2))
        const q = int(2).toVar()
        Loop(order.sub(int(1)), () => {
                const mask = q.sub(int(1)).toVar()
                const pq = p.bitAnd(ivec3(q)).toVar()
                If(pq.z.equal(q), () => void p.x.bitXorAssign(mask))
                If(pq.z.equal(int(0)), () => {
                        const t3 = p.x.bitXor(p.z).bitAnd(mask).toVar()
                        p.x.bitXorAssign(t3)
                        p.z.bitXorAssign(t3)
                })
                If(pq.y.equal(q), () => void p.x.bitXorAssign(mask))
                If(pq.y.equal(int(0)), () => {
                        const t4 = p.x.bitXor(p.y).bitAnd(mask).toVar()
                        p.x.bitXorAssign(t4)
                        p.y.bitXorAssign(t4)
                })
                If(pq.x.equal(q), () => void p.x.bitXorAssign(mask))
                q.shiftLeftAssign(int(1))
        })
        return vec3(p)
})

const hilbertSDF = Fn(([p, order]: [Vec3, Int]): Float => {
        const n1f = int(1).shiftLeft(order).sub(int(1)).toFloat().toVar()
        const scale = n1f.reciprocal().mul(2).toVar()
        const d = float(1e6).toVar()
        Loop(int(1).shiftLeft(int(3).mul(order)).sub(int(1)), ({ i }) => {
                const a = hilbert3(i, order).mul(scale).sub(1)
                const b = hilbert3(int(1).add(i), order).mul(scale).sub(1)
                d.assign(d.min(segment(p, a, b).sub(float(0.035))))
        })
        return d
})

export const fragment = Scope<Vec4>(() => {
        const eps = vec3(0.002, 0, 0)
        const eye = rotate3dX(iDrag.y.negate()).mul(rotate3dY(iDrag.x.negate())).mul(vec3(0, 0, 7.5))
        const order = int(iTime.mod(MAX_ORDER).add(1))
        const march = Fn(([eye, dir]: [Vec3, Vec3]): Vec3 => {
                const p = eye.toVar()
                const d = float(0).toVar()
                Loop(32, () => {
                        d.assign(hilbertSDF(p, order))
                        If(d.lessThanEqual(eps.x), () => vec3(hilbertSDF(p.add(eps.xyy), order), hilbertSDF(p.add(eps.yxy), order), hilbertSDF(p.add(eps.yyx), order)).sub(d))
                        If(d.greaterThan(float(10)), () => vec3(0))
                        p.addAssign(d.mul(dir))
                })
                return vec3(0)
        })
        const z = eye.negate().normalize()
        const x = z.cross(vec3(0, 1, 0)).normalize()
        const y = x.cross(z)
        const dir = mat3(x, y, z)
                .mul(vec3(uv.sub(float(0.5)), 1.6))
                .normalize()
        return vec4(march(eye, dir).normalize(), 1)
})

export default () => (
        <Layout noFooter>
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%' }}>
                        <canvas ref={useGL({ fragment }).ref} />
                </div>
        </Layout>
)
