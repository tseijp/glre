import Layout from '@theme/Layout'
import { useGL } from 'glre/src/react'
import { Fn, If, Loop, Scope, float, int, iResolution, iTime, uv, vec2, vec3, vec4 } from 'glre/src/node'
import type { Int, Vec2, Vec4 } from 'glre/src/node'

const compact1By1 = Fn(([x]: [Int]): Int => {
        const v = x.bitAnd(int(0x55555555)).toVar()
        v.assign(v.bitXor(v.shiftRight(int(1))).bitAnd(int(0x33333333)))
        v.assign(v.bitXor(v.shiftRight(int(2))).bitAnd(int(0x0f0f0f0f)))
        v.assign(v.bitXor(v.shiftRight(int(4))).bitAnd(int(0x00ff00ff)))
        v.assign(v.bitXor(v.shiftRight(int(8))).bitAnd(int(0x0000ffff)))
        return v
})

const mortonDecode2D = Fn(([c]: [Int]): Vec2 => {
        const x = compact1By1(c).toVar()
        const y = compact1By1(c.shiftRight(int(1))).toVar()
        return vec2(x.toFloat(), y.toFloat())
})

const segment = Fn(([p, a, b]: [Vec2, Vec2, Vec2]) => {
        const q = vec4(p.sub(a), b.sub(a)).toVar()
        const d = q.xy.sub(q.zw.mul(q.xy.dot(q.zw).div(q.zw.dot(q.zw)).clamp(0, 1))).toVar()
        return d.dot(d)
})

export const fragment = Scope<Vec4>(() => {
        const res = int(1).shiftLeft(int(5)).toVar()
        const res2 = res.mul(res).toVar()
        const res2m1 = res2.sub(int(1)).toVar()
        const resm1f = res.sub(int(1)).toFloat().toVar()
        const aspect = iResolution.x.div(iResolution.y).toVar()
        const p = uv.sub(0.5).mul(vec2(aspect, 1)).mul(2).toVar()
        const len = int(iTime.mul(2)).bitAnd(res2m1).toVar()
        const d = float(1e6).toVar()
        Loop(len, ({ i }) => {
                const a = mortonDecode2D(i).div(resm1f).mul(2).sub(1).toVar()
                const b = mortonDecode2D(int(1).add(i)).div(resm1f).mul(2).sub(1).toVar()
                d.assign(d.min(segment(p, a, b)))
        })
        const t = float(1).div(iResolution.y).mul(1.5).pow(2).toVar()
        const col = vec3(t.mul(2).smoothstep(t, d).oneMinus()).toVar()
        If(len.lessThan(int(1)), () => void col.assign(vec3(0)))
        return vec4(col, 1)
})

export default () => (
        <Layout noFooter>
                <div style={{ position: 'fixed', top: 60, left: 0, width: '100%', height: 'calc(100% - 60px)' }}>
                        <canvas ref={useGL({ fragment }).ref} />
                </div>
        </Layout>
)
