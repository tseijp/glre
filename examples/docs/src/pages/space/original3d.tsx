import Layout from '@theme/Layout'
import { useGL } from 'glre/src/react'
import { Fn, Scope, float, iResolution, iDrag, varying, instance, vec4 } from 'glre/src/node'
import { box } from 'glre/src/buffers'
import { rotate4dX, rotate4dY, perspective } from 'glre/src/addons'

const URL = 'https://pub-a3916cfad25545dc917e91549e7296bc.r2.dev/v3/78_76.png'

const STEP = 16
const CUBE = STEP * STEP * STEP
const geo = box({ width: 1, height: 1, depth: 1 })

const vertex = Scope(() => {
        const modelMat = rotate4dX(iDrag.y).mul(rotate4dY(iDrag.x))
        const projMat = perspective(float(1.0), iResolution.x.div(iResolution.y), float(0.1), float(100))
        const pos = []
        const offset = (STEP - 1) / 2
        const scale = 2.0 / (STEP - 1)
        for (let i = 0; i < STEP; i++) for (let j = 0; j < STEP; j++) for (let k = 0; k < STEP; k++) pos.push((i - offset) * scale, (j - offset) * scale, (k - offset) * scale)
        const instancePos = instance(pos)
        const localPos = vec4(geo.vertex.add(instancePos), 1)
        const cameraOffset = vec4(0, 0, -4, 0)
        const worldPos = modelMat.mul(localPos).add(cameraOffset)
        return projMat.mul(worldPos)
})
const fragment = Scope(() => {
        return vec4(varying(geo.normal), 1)
})

export default () => (
        <Layout noFooter>
                <div style={{ position: 'fixed', top: 60, left: 0, width: '100%', height: 'calc(100% - 60px)' }}>
                        <canvas ref={useGL({ wireframe: true, fragment, vertex, isWebGL: true, isDepth: true, triangleCount: 12, instanceCount: CUBE }).ref} />
                </div>
        </Layout>
)
