import Layout from '@theme/Layout'
import { useGL } from 'glre/src/react'
import { Fn, Scope, float, int, iMouse, ivec2, uv, vec3, vec4 } from 'glre/src/node'
import type { Float, Int, Vec2, Vec3, Vec4 } from 'glre/src/node'

const MAX_STEPS = 12

const ij2id = Fn(([ij, step]: [Vec2, Int]): Int => {
        const p = ij.toIVec2().toVar()
        const lh = ivec2(step.shiftRight(int(1)), step.sub(step.shiftRight(int(1)))).toVar()
        const masks = ivec2(int(1)).shiftLeft(lh).sub(ivec2(1)).toVar()
        const xParts = ivec2(p.x, p.x.shiftRight(lh.x)).bitAnd(masks).toVar()
        const yParts = ivec2(p.y, p.y.shiftRight(lh.x)).bitAnd(masks).toVar()
        const ids = xParts.add(yParts.shiftLeft(lh)).toVar()
        return ids.x.add(ids.y.shiftLeft(lh.x.add(lh.x)))
})

const id2xyz = Fn(([id, side]: [Int, Float]): Vec3 => {
        const sidef = side.toVar()
        const maxf = sidef.mul(sidef).mul(sidef).sub(1).toVar()
        const idf = id.toFloat().clamp(0, maxf).toVar()
        const x = idf.mod(sidef).toVar()
        const yz = idf.div(sidef).floor().toVar()
        const y = yz.mod(sidef).toVar()
        const z = yz.div(sidef).floor().toVar()
        return vec3(x, y, z)
})

const fragment = Scope<Vec4>(() => {
        const step = int(iMouse.x.mul(MAX_STEPS).mod(MAX_STEPS).add(1)).toVar()
        const n = int(1).shiftLeft(step).toVar()
        const n1f = n.toFloat().sub(1).toVar()
        const ij = uv.mul(n1f).add(0.5).floor().clamp(0, n1f).toVar()
        const max2 = n.mul(n).sub(int(1)).toVar()
        const id = ij2id(ij, step).clamp(int(0), max2).toVar()
        const side = n.toFloat().pow(float(0.6666667)).add(0.5).floor().clamp(float(2), float(4096)).toVar()
        const xyz = id2xyz(id, side).toVar()
        const col = xyz.div(side.sub(1)).toVar()
        return vec4(col, 1)
})

export default () => (
        <Layout noFooter>
                <div style={{ position: 'fixed', top: 60, left: 0, width: '100%', height: 'calc(100% - 60px)' }}>
                        <canvas ref={useGL({ fragment }).ref} />
                </div>
        </Layout>
)
