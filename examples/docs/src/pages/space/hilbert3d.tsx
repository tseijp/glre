import Layout from '@theme/Layout'
import { useGL } from 'glre/src/react'
import { Fn, If, Loop, Scope, int, iMouse, iResolution, iDrag, varying, instance, vec3, vec4, ivec3, mat3 } from 'glre/src/node'
import { rotate3dX, rotate3dY, perspective } from 'glre/src/addons'
import { box } from 'glre/src/buffers'
import type { Int, IVec3, Vec3 } from 'glre/src/node'

const MAX_STEP = 5
const MAX_CUBE = (1 << (3 * MAX_STEP)) - 1

const LUT_H2M = [48, 33, 35, 26, 30, 79, 77, 44, 78, 68, 64, 50, 51, 25, 29, 63, 27, 87, 86, 74, 72, 52, 53, 89, 83, 18, 16, 1, 5, 60, 62, 15, 0, 52, 53, 57, 59, 87, 86, 66, 61, 95, 91, 81, 80, 2, 6, 76, 32, 2, 6, 12, 13, 95, 91, 17, 93, 41, 40, 36, 38, 10, 11, 31, 14, 79, 77, 92, 88, 33, 35, 82, 70, 10, 11, 23, 21, 41, 40, 4, 19, 25, 29, 47, 46, 68, 64, 34, 45, 60, 62, 71, 67, 18, 16, 49]

const h2m = Fn(([hilbert, bits]: [Int, Int]): Int => {
        const state = int(0).toVar()
        const output = int(0).toVar()
        const step = int(0).toVar()
        Loop(bits, () => {
                const shift = int(3)
                        .mul(bits.sub(step).sub(int(1)))
                        .toVar()
                const octant = hilbert.shiftRight(shift).bitAnd(int(7)).toVar()
                const idx = state.bitOr(octant).toVar()
                const entry = int(LUT_H2M[0]).toVar()
                If(idx.equal(int(0)), () => void entry.assign(int(LUT_H2M[0])))
                for (let j = 1; j < LUT_H2M.length; j++) {
                        If(idx.equal(int(j)), () => void entry.assign(int(LUT_H2M[j])))
                }
                output.assign(output.shiftLeft(int(3)).bitOr(entry.bitAnd(int(7))))
                state.assign(entry.bitAnd(int(~7)))
                step.addAssign(int(1))
        })
        return output
})

/**
 * morton
 */
const m3ff = int(0x000003ff).constant()
const mff0000ff = int(0xff0000ff).constant()
const m0300f00f = int(0x0300f00f).constant()
const m030c30c3 = int(0x030c30c3).constant()
const m09249249 = int(0x09249249).constant()

const m2xyz = Fn(([c]: [Int]): IVec3 => {
        const p = ivec3(c, c.shiftRight(int(1)), c.shiftRight(int(2))).toVar()
        p.bitAndAssign(ivec3(m09249249))
        p.bitXorAssign(p.shiftRight(int(2)))
        p.bitAndAssign(ivec3(m030c30c3))
        p.bitXorAssign(p.shiftRight(int(4)))
        p.bitAndAssign(ivec3(m0300f00f))
        p.bitXorAssign(p.shiftRight(int(8)))
        p.bitAndAssign(ivec3(mff0000ff))
        p.bitXorAssign(p.shiftRight(int(16)))
        p.bitAndAssign(ivec3(m3ff))
        return p
})

/**
 * hilbert
 */
const h2xyz = Fn(([index, step]: [Int, Int]): Vec3 => {
        const morton = h2m(index, step)
        return vec3(m2xyz(morton))
})

const index = instance<'float'>(Array.from({ length: MAX_CUBE }, (_, i) => i))

const vertex = Scope(() => {
        const step = iMouse.x.mul(MAX_STEP).floor().add(1).clamp(1, MAX_STEP).toInt().toVar()
        const base = int(1).shiftLeft(step).toFloat().toVar()
        const n1f = base.sub(1).toVar()
        const max = base.pow(3).sub(1).toVar()
        const offset = n1f.mul(0.5).toVar()
        const scale = offset.reciprocal().toVar()
        const a = h2xyz(index.toInt(), step).sub(offset).mul(scale).toVar()
        const b = h2xyz(index.add(1).toInt(), step).sub(offset).mul(scale).toVar()
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
