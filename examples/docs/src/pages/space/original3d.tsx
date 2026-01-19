import Layout from '@theme/Layout'
import { useGL } from 'glre/src/react'
import { Fn, If, Scope, int, iMouse, iResolution, iDrag, varying, instance, vec3, vec4, ivec2, ivec3, mat3 } from 'glre/src/node'
import { rotate3dX, rotate3dY, perspective } from 'glre/src/addons'
import { box } from 'glre/src/buffers'
import type { Int, Vec3 } from 'glre/src/node'

const MAX_STEP = 5
const MAX_CUBE = (1 << (3 * MAX_STEP)) - 1

const original3 = Fn(([index, step]: [Int, Int]): Vec3 => {
        const lh = ivec2(step.shiftRight(int(1)), step.sub(step.shiftRight(int(1)))).toVar()
        const masks = ivec2(int(1)).shiftLeft(lh).sub(ivec2(1)).toVar()
        const span = lh.x.mul(int(3)).toVar()
        const spanMask = int(1).shiftLeft(span).sub(int(1)).toVar()
        const lowPart = index.bitAnd(spanMask).toVar()
        const highPart = index.shiftRight(span).toVar()
        const lowX = lowPart.bitAnd(masks.x).toVar()
        const lowY = lowPart.shiftRight(lh.x).bitAnd(masks.x).toVar()
        const lowZ = lowPart
                .shiftRight(lh.x.mul(int(2)))
                .bitAnd(masks.x)
                .toVar()
        const highX = highPart.bitAnd(masks.y).toVar()
        const highY = highPart.shiftRight(lh.y).bitAnd(masks.y).toVar()
        const highZ = highPart
                .shiftRight(lh.y.mul(int(2)))
                .bitAnd(masks.y)
                .toVar()
        return vec3(lowX.add(highX.shiftLeft(lh.x)), lowY.add(highY.shiftLeft(lh.x)), lowZ.add(highZ.shiftLeft(lh.x)))
})

const index = instance<'float'>(Array.from({ length: MAX_CUBE }, (_, i) => i))

const vertex = Scope(() => {
        const step = iMouse.x.mul(MAX_STEP).floor().add(1).clamp(1, MAX_STEP).toInt().toVar()
        const base = int(1).shiftLeft(step).toFloat().toVar()
        const n1f = base.sub(1).toVar()
        const max = base.pow(3).sub(1).toVar()
        const offset = n1f.mul(0.5).toVar()
        const scale = offset.reciprocal().toVar()
        const a = original3(index.toInt(), step).sub(offset).mul(scale).toVar()
        const b = original3(index.add(1).toInt(), step).sub(offset).mul(scale).toVar()
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
