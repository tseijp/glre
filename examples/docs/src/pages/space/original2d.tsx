import Layout from '@theme/Layout'
import { useGL } from 'glre/src/react'
import { Fn, Scope, float, int, iMouse, iResolution, ivec2, uv, vec2, vec3, vec4 } from 'glre/src/node'
import type { Int, Vec2, Vec4 } from 'glre/src/node'

const MAX_STEPS = 10

const segment = Fn(([p, a, b]: [Vec2, Vec2, Vec2]) => {
        const q = vec4(p.sub(a), b.sub(a)).toVar()
        const d = q.xy.sub(q.zw.mul(q.xy.dot(q.zw).div(q.zw.dot(q.zw)).clamp(0, 1))).toVar()
        return d.dot(d)
})

const ij2id = Fn(([ij, step]: [Vec2, Int]): Int => {
        const p = ij.toIVec2().toVar()
        const lh = ivec2(step.shiftRight(int(1)), step.sub(step.shiftRight(int(1)))).toVar()
        const masks = ivec2(int(1)).shiftLeft(lh).sub(ivec2(1)).toVar()
        const xParts = ivec2(p.x, p.x.shiftRight(lh.x)).bitAnd(masks).toVar()
        const yParts = ivec2(p.y, p.y.shiftRight(lh.x)).bitAnd(masks).toVar()
        const ids = xParts.add(yParts.shiftLeft(lh)).toVar()
        return ids.x.add(ids.y.shiftLeft(lh.x.add(lh.x)))
})

const id2ij = Fn(([id, step]: [Int, Int]): Vec2 => {
        const lh = ivec2(step.shiftRight(int(1)), step.sub(step.shiftRight(int(1)))).toVar()
        const masks = ivec2(int(1)).shiftLeft(lh).sub(ivec2(1)).toVar()
        const span = lh.x.add(lh.x).toVar()
        const parts = ivec2(id, id.shiftRight(span)).toVar()
        parts.bitAndAssign(ivec2(int(1).shiftLeft(span).sub(int(1)), int(-1)))
        const lowXY = ivec2(parts.x, parts.x.shiftRight(lh.x)).bitAnd(ivec2(masks.x)).toVar()
        const highXY = ivec2(parts.y, parts.y.shiftRight(lh.y)).bitAnd(ivec2(masks.y)).shiftLeft(ivec2(lh.x)).toVar()
        return vec2(lowXY.add(highXY))
})

const fragment = Scope<Vec4>(() => {
        const step = int(iMouse.x.mul(MAX_STEPS).mod(MAX_STEPS).add(1)).toVar()
        const num = int(1).shiftLeft(step).toVar()
        const n1f = num.toFloat().sub(1).toVar()
        const max = num.mul(num).sub(int(1)).toVar()
        const pos = uv.sub(0.5).mul(2).mul(iResolution.div(iResolution.y)).toVar()
        const ij = pos.mul(0.5).add(0.5).mul(n1f).add(0.5).floor().clamp(0, n1f).toVar()
        const id = ij2id(ij, step).clamp(int(0), max).toVar()
        const ids = ivec2(id).add(ivec2(-1, 1)).clamp(int(0), max).toVar()
        const scale = (p: Vec2) => p.div(n1f).mul(2).sub(1)
        const a = scale(id2ij(ids.x, step)).toVar()
        const b = scale(ij).toVar()
        const c = scale(id2ij(ids.y, step)).toVar()
        const d = segment(pos, a, b).min(segment(pos, b, c)).toVar()
        const t = float(1).div(iResolution.y).mul(1.5).pow(2).toVar()
        const idf = id.toFloat().div(max.toFloat()).toVar()
        const grad = vec3(0, 1, 1).mix(vec3(1, 1, 0), idf).toVar()
        const col = t.mul(2).smoothstep(t, d).mul(grad).oneMinus().toVar()
        return vec4(col, 1)
})

export default () => (
        <Layout noFooter>
                <div style={{ position: 'fixed', top: 60, left: 0, width: '100%', height: 'calc(100% - 60px)' }}>
                        <canvas ref={useGL({ fragment }).ref} />
                </div>
        </Layout>
)
