import Layout from '@theme/Layout'
import { useGL } from 'glre/src/react'
import { Fn, If, Loop, Scope, int, iMouse, iResolution, iDrag, varying, instance, vec3, vec4, ivec3, mat3 } from 'glre/src/node'
import { rotate3dX, rotate3dY, perspective } from 'glre/src/addons'
import { box } from 'glre/src/buffers'
import type { Int, Vec3 } from 'glre/src/node'

const MAX_STEP = 5
const MAX_CUBE = (1 << (3 * MAX_STEP)) - 1

const hilbert3 = Fn(([index, step]: [Int, Int]): Vec3 => {
        const t = index.toVar()
        const p = ivec3(0).toVar()
        const bit = int(0).toVar()
        Loop(step, () => {
                const base = bit.mul(int(3)).toVar()
                p.x.addAssign(t.shiftRight(int(2).add(base)).bitAnd(int(1)).shiftLeft(bit))
                p.y.addAssign(t.shiftRight(int(1).add(base)).bitAnd(int(1)).shiftLeft(bit))
                p.z.addAssign(t.shiftRight(base).bitAnd(int(1)).shiftLeft(bit))
                bit.addAssign(int(1))
        })
        p.assign(p.bitXor(ivec3(p.z.shiftRight(int(1)), p.x, p.y)))
        const q = int(2).toVar()
        Loop(step.sub(int(1)), () => {
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

const index = instance<'float'>(Array.from({ length: MAX_CUBE }, (_, i) => i))

const vertex = Scope(() => {
        const step = iMouse.x.mul(MAX_STEP).floor().add(1).clamp(1, MAX_STEP).toInt().toVar()
        const base = int(1).shiftLeft(step).toFloat().toVar()
        const n1f = base.sub(1).toVar()
        const max = base.pow(3).sub(1).toVar()
        const offset = n1f.mul(0.5).toVar()
        const scale = offset.reciprocal().toVar()
        const a = hilbert3(index.toInt(), step).sub(offset).mul(scale).toVar()
        const b = hilbert3(index.add(1).toInt(), step).sub(offset).mul(scale).toVar()
        const direct = b.sub(a).toVar()
        const normal = direct.normalize().toVar()
        const up = vec3(0, 1, 0).toVar()
        If(normal.y.abs().greaterThan(0.99), () => {
                up.assign(vec3(1, 0, 0))
        })
        const right = up.cross(normal).normalize().toVar()
        const pos = vec3(0).toVar()
        If(index.lessThan(max), () => {
                const geometry = box({ width: 0.015, height: 1.0, depth: 0.015, needNormal: false })
                const center = a.add(b).mul(0.5)
                const rotate = mat3(right, normal, normal.cross(right)).mul(geometry.vertex.mul(vec3(1, direct.length(), 1)))
                pos.assign(center.add(rotate))
        }).Else(() => {
                pos.assign(vec3(0, 0, -1000))
        })
        return perspective(1.0, iResolution.x.div(iResolution.y), 0.1, 100).mul(vec4(rotate3dX(iDrag.y).mul(rotate3dY(iDrag.x)).mul(pos), 1).add(vec4(0, 0, -3, 0)))
})

const fragment = Scope(() => {
        const step = iMouse.x.mul(MAX_STEP).floor().add(1).clamp(1, MAX_STEP)
        const max = int(1).shiftLeft(step.mul(3).toInt()).toFloat().sub(1)
        const col = vec3(1, 0, 0).mix(vec3(0, 0, 1), varying(index).div(max))
        return vec4(col, 1)
})

export default () => (
        <Layout noFooter>
                <div style={{ position: 'fixed', top: 60, left: 0, width: '100%', height: 'calc(100% - 60px)' }}>
                        <canvas ref={useGL({ fragment, vertex, isWebGL: true, isDepth: true, triangleCount: 12, instanceCount: MAX_CUBE }).ref} />
                </div>
        </Layout>
)
