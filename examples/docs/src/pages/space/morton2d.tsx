import Layout from '@theme/Layout'
import { useGL } from 'glre/src/react'
import { Fn, If, Scope, int, iTime, uv, vec3, vec4 } from 'glre/src/node'
import type { Int, Vec4 } from 'glre/src/node'

const part1By1 = Fn(([x]: [Int]): Int => {
        const v = x.bitAnd(int(0x0000ffff)).toVar()
        v.assign(v.bitXor(v.shiftLeft(int(8))).bitAnd(int(0x00ff00ff)))
        v.assign(v.bitXor(v.shiftLeft(int(4))).bitAnd(int(0x0f0f0f0f)))
        v.assign(v.bitXor(v.shiftLeft(int(2))).bitAnd(int(0x33333333)))
        v.assign(v.bitXor(v.shiftLeft(int(1))).bitAnd(int(0x55555555)))
        return v
})

const mortonEncode2D = Fn(([x, y]: [Int, Int]): Int => part1By1(y).shiftLeft(int(1)).add(part1By1(x)))

export const fragment = Scope<Vec4>(() => {
        const res = int(1).shiftLeft(int(5)).toVar()
        const res2 = res.mul(res).toVar()
        const res2m1 = res2.sub(int(1)).toVar()
        const fres = res.toFloat().toVar()
        const vuv = uv.mul(fres).toVar()
        const uuv = vuv.floor().toIVec2().toVar()
        const curveIndex = mortonEncode2D(uuv.x, uuv.y).bitAnd(res2m1).toVar()
        const col = vec3(curveIndex.toFloat().div(res2.toFloat())).toVar()
        const tick = int(iTime.mul(3)).bitAnd(res2m1).toVar()
        If(curveIndex.equal(tick), () => {
                col.assign(vec3(1, 0, 0))
        })
        return vec4(col, 1)
})

export default () => (
        <Layout noFooter>
                <div style={{ position: 'fixed', top: 60, left: 0, width: '100%', height: 'calc(100% - 60px)' }}>
                        <canvas ref={useGL({ fragment }).ref} />
                </div>
        </Layout>
)
