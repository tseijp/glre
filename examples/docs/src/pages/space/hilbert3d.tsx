import Layout from '@theme/Layout'
import { useGL } from 'glre/src/react'
import { Fn, If, Loop, float, int, iDrag, iResolution, iTime, mat3, position, Scope, vec2, vec3, vec4 } from 'glre/src/node'
import { rotate3dX, rotate3dY } from 'glre/src/addons'
import type { Int, Vec3, Vec4 } from 'glre/src/node'

const MAX_ORDER = 1

const hilbert3 = Fn(([index, order]: [Int, Int]) => {
        const t = index.toVar()
        const x = int(0).toVar()
        const y = int(0).toVar()
        const z = int(0).toVar()
        const bit = int(0).toVar()
        Loop(order, () => {
                const base = bit.mul(int(3)).toVar()
                x.addAssign(
                        t
                                .shiftRight(base.add(int(2)))
                                .bitAnd(int(1))
                                .shiftLeft(bit)
                )
                y.addAssign(
                        t
                                .shiftRight(base.add(int(1)))
                                .bitAnd(int(1))
                                .shiftLeft(bit)
                )
                z.addAssign(t.shiftRight(base).bitAnd(int(1)).shiftLeft(bit))
                bit.addAssign(int(1))
        })
        const t2 = z.shiftRight(int(1)).toVar()
        z.assign(z.bitXor(y))
        y.assign(y.bitXor(x))
        x.assign(x.bitXor(t2))
        const q = int(2).toVar()
        Loop(order.sub(int(1)), () => {
                const p = q.sub(int(1)).toVar()
                const zq = z.bitAnd(q).toVar()
                If(zq.equal(q), () => void x.bitXorAssign(p))
                If(zq.equal(int(0)), () => {
                        const t3 = x.bitXor(z).bitAnd(p).toVar()
                        x.bitXorAssign(t3)
                        z.bitXorAssign(t3)
                })
                const yq = y.bitAnd(q).toVar()
                If(yq.equal(q), () => void x.bitXorAssign(p))
                If(yq.equal(int(0)), () => {
                        const t4 = x.bitXor(y).bitAnd(p).toVar()
                        x.bitXorAssign(t4)
                        y.bitXorAssign(t4)
                })
                If(x.bitAnd(q).equal(q), () => void x.bitXorAssign(p))
                q.shiftLeftAssign(int(1))
        })
        return vec3(x.toFloat(), y.toFloat(), z.toFloat())
})

const sdSegment = Fn(([p, a, b]: [Vec3, Vec3, Vec3]) => {
        const pa = p.sub(a).toVar()
        const ba = b.sub(a).toVar()
        return pa.sub(ba.mul(pa.dot(ba).div(ba.dot(ba)).clamp(0, 1))).length()
})

const hilbertSDF = Fn(([p, order]: [Vec3, Int]) => {
        const n1f = int(1).shiftLeft(order).sub(int(1)).toFloat().toVar()
        const minD = float(1e6).toVar()
        const i = int(0).toVar()
        Loop(
                int(1)
                        .shiftLeft(order.mul(int(3)))
                        .sub(int(1)),
                () => {
                        minD.assign(
                                minD.min(
                                        sdSegment(
                                                p,
                                                hilbert3(i, order).div(n1f).mul(2).sub(1),
                                                hilbert3(i.add(int(1)), order)
                                                        .div(n1f)
                                                        .mul(2)
                                                        .sub(1)
                                        ).sub(float(0.035))
                                )
                        )
                        If(minD.lessThan(float(0.001)), () => {
                                return vec2(minD, float(1))
                        })
                        i.addAssign(int(1))
                }
        )
        return vec2(minD, float(1))
})

export const fragment = Scope<Vec4>(() => {
        const up = vec3(0, 1, 0)
        const eps = vec3(0.002, 0, 0)
        const eye = rotate3dX(iDrag.y.negate()).mul(rotate3dY(iDrag.x.negate())).mul(vec3(0, 0, 5))
        const order = int(iTime.mod(MAX_ORDER).add(1))
        const march = Fn(([eye, dir]: [Vec3, Vec3]) => {
                const p = eye.toVar()
                const d = hilbertSDF(p, order).x.toVar()
                const totalD = float(0).toVar()
                Loop(64, () => {
                        If(d.lessThanEqual(eps.x), () => {
                                return vec4(
                                        vec3(hilbertSDF(p.add(eps.xyy), order).x.sub(d), hilbertSDF(p.add(eps.yxy), order).x.sub(d), hilbertSDF(p.add(eps.yyx), order).x.sub(d))
                                                .normalize()
                                                .mul(0.5)
                                                .add(0.5)
                                                .mul(vec3(0.2, 0.7, 0.95)),
                                        1
                                )
                        })
                        If(totalD.greaterThan(float(10)), () => {
                                return vec4(0)
                        })
                        p.addAssign(d.mul(dir))
                        totalD.addAssign(d)
                        d.assign(hilbertSDF(p, order).x)
                })
                return vec4(0)
        })
        const z = eye.negate().normalize()
        const x = z.cross(up).normalize()
        const y = x.cross(z)
        const dir = mat3(x, y, z)
                .mul(vec3(position.xy.div(iResolution.xy).sub(vec2(0.5)), 1.6))
                .normalize()
        return march(eye, dir)
})

export default () => {
        const gl = useGL({ fragment })
        return (
                <Layout noFooter>
                        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%' }}>
                                <canvas ref={gl.ref} />
                        </div>
                </Layout>
        )
}
