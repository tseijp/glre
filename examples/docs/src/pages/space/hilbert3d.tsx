import Layout from '@theme/Layout'
import { useGL } from 'glre/src/react'
import { Fn, If, Loop, Scope, int, iMouse, iResolution, iDrag, varying, instance, vec3, vec4, ivec3, mat3 } from 'glre/src/node'
import { rotate3dX, rotate3dY, perspective } from 'glre/src/addons'
import { box } from 'glre/src/buffers'
import type { Int, IVec3, Vec3 } from 'glre/src/node'

const MAX_STEP = 5
const MAX_CUBE = (1 << (3 * MAX_STEP)) - 1

const LUT_H2M = [0x00, 0x01, 0x03, 0x02, 0x07, 0x06, 0x04, 0x05, 0x58, 0x59, 0x5b, 0x5a, 0x5f, 0x5e, 0x5c, 0x5d, 0x10, 0x13, 0x17, 0x14, 0x1d, 0x1e, 0x1a, 0x19, 0x48, 0x4b, 0x4f, 0x4c, 0x45, 0x46, 0x42, 0x41, 0x20, 0x23, 0x27, 0x24, 0x2d, 0x2e, 0x2a, 0x29, 0x78, 0x7b, 0x7f, 0x7c, 0x75, 0x76, 0x72, 0x71, 0x30, 0x31, 0x33, 0x32, 0x37, 0x36, 0x34, 0x35, 0x68, 0x69, 0x6b, 0x6a, 0x6f, 0x6e, 0x6c, 0x6d, 0xa0, 0xa1, 0xa3, 0xa2, 0xa7, 0xa6, 0xa4, 0xa5, 0xf8, 0xf9, 0xfb, 0xfa, 0xff, 0xfe, 0xfc, 0xfd, 0xb0, 0xb3, 0xb7, 0xb4, 0xbd, 0xbe, 0xba, 0xb9, 0xe8, 0xeb, 0xef, 0xec, 0xe5, 0xe6, 0xe2, 0xe1]

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
const m2xyz = Fn(([morton, bits]: [Int, Int]): IVec3 => {
        const x = int(0).toVar()
        const y = int(0).toVar()
        const z = int(0).toVar()
        const bit = int(0).toVar()
        Loop(bits, () => {
                const shift = bit.mul(int(3)).toVar()
                x.bitOrAssign(morton.shiftRight(shift).bitAnd(int(1)).shiftLeft(bit))
                z.bitOrAssign(
                        morton
                                .shiftRight(shift.add(int(1)))
                                .bitAnd(int(1))
                                .shiftLeft(bit)
                )
                y.bitOrAssign(
                        morton
                                .shiftRight(shift.add(int(2)))
                                .bitAnd(int(1))
                                .shiftLeft(bit)
                )
                bit.addAssign(int(1))
        })
        return ivec3(x, y, z)
})

/**
 * hilbert
 */
const h2xyz = Fn(([index, step]: [Int, Int]): Vec3 => {
        const morton = h2m(index, step)
        return vec3(m2xyz(morton, step))
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
