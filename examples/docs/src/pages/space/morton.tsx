import Layout from '@theme/Layout'
import { useGL } from 'glre/src/react'
import { Fn, Scope, float, int, iMouse, ivec2, uv, vec3, vec4 } from 'glre/src/node'
import type { Float, Int, Vec2, Vec3, Vec4 } from 'glre/src/node'

const MAX_STEPS = 12

const mffff = int(0x0000ffff).constant()
const m00ff = int(0x00ff00ff).constant()
const m0f0f = int(0x0f0f0f0f).constant()
const m3333 = int(0x33333333).constant()
const m5555 = int(0x55555555).constant()

const ij2id = Fn(([ij]: [Vec2]): Int => {
        const p = ij.toIVec2().toVar()
        p.bitAndAssign(ivec2(mffff))
        p.bitXorAssign(p.shiftLeft(int(8)))
        p.bitAndAssign(ivec2(m00ff))
        p.bitXorAssign(p.shiftLeft(int(4)))
        p.bitAndAssign(ivec2(m0f0f))
        p.bitXorAssign(p.shiftLeft(int(2)))
        p.bitAndAssign(ivec2(m3333))
        p.bitXorAssign(p.shiftLeft(int(1)))
        p.bitAndAssign(ivec2(m5555))
        return p.y.shiftLeft(int(1)).add(p.x)
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
        const id = ij2id(ij).clamp(int(0), max2).toVar()
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
