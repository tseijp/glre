import Layout from '@theme/Layout'
import { useGL } from 'glre/src/react'
import { attribute, instance, uniform, mat4, Scope, varying } from 'glre/src/node'

const col = 4
const row = 4
const instanceCount = col * row

const createProjectionMatrix = (fov = (2 * Math.PI) / 5, near = 1, far = 100) => {
        const aspect = window.innerWidth / window.innerHeight
        const t = Math.tan(Math.PI * 0.5 - 0.5 * fov)
        const r = 1.0 / (near - far)
        // prettier-ignore
        return [
                t / aspect, 0, 0, 0,
                0, t, 0, 0,
                0, 0, (near + far) * r, -1,
                0, 0, near * far * r * 2, 0
        ]
}

const createViewMatrix = (x = 0, y = 0, z = -12) => {
        // prettier-ignore
        return [
                1, 0, 0, 0,
                0, 1, 0, 0,
                0, 0, 1, 0,
                x, y, z, 1
        ]
}

const createPosition = () => {
        const step = 4.0
        const positions = [] as number[]
        for (let i = 0; i < col; i++)
                for (let j = 0; j < row; j++) {
                        const x = step * (i - col / 2 + 0.5)
                        const y = step * (j - row / 2 + 0.5)
                        positions.push(x, y)
                }
        return positions
}

const createRotations = () => {
        const rotations = []
        for (let i = 0; i < instanceCount; i++) rotations.push(0)
        return rotations
}

const p = 1
const n = -1

// prettier-ignore
const cubePositions = [
        p, n, p, 1,  n, n, p, 1,  n, n, n, 1,  p, n, n, 1,  p, n, p, 1,  n, n, n, 1,
        p, p, p, 1,  p, n, p, 1,  p, n, n, 1,  p, p, n, 1,  p, p, p, 1,  p, n, n, 1,
        n, p, p, 1,  p, p, p, 1,  p, p, n, 1,  n, p, n, 1,  n, p, p, 1,  p, p, n, 1,
        n, n, p, 1,  n, p, p, 1,  n, p, n, 1,  n, n, n, 1,  n, n, p, 1,  n, p, n, 1,
        p, p, p, 1,  n, p, p, 1,  n, n, p, 1,  n, n, p, 1,  p, n, p, 1,  p, p, p, 1,
        p, n, n, 1,  n, n, n, 1,  n, p, n, 1,  p, p, n, 1,  p, n, n, 1,  n, p, n, 1,
]

export default function InstancedBoxes() {
        const rotation = createRotations()
        const box = attribute<'vec4'>(cubePositions, 'box') // 144 len
        const pos = instance<'vec2'>(createPosition()) // 32 len (16 instances * 2 components)
        const rot = instance<'float'>(rotation) // 16 len (16 instances * 1 component)

        const projectionMatrix = uniform<'mat4'>(mat4())
        const viewMatrix = uniform<'mat4'>(mat4())

        const gl = useGL({
                instanceCount, // 16
                triangleCount: 12, // 6 × 2
                isWebGL: true,
                isDepth: true,
                render() {
                        for (let i = 0; i < instanceCount; i++) rotation[i] += 0.01 + i * 0.005
                        rot.value = rotation
                },
                resize() {
                        projectionMatrix.value = createProjectionMatrix()
                        viewMatrix.value = createViewMatrix()
                },
                frag: varying(box),
                vert: Scope(() => {
                        const c = rot.cos().toVar('c')
                        const s = rot.sin().toVar('s')
                        // prettier-ignore
                        const rotationMatrix = mat4(
                                c, s.negate(), 0, 0,
                                s, c, 0, 0,
                                0, 0, 1, 0,
                                0, 0, 0, 1
                        )
                        // prettier-ignore
                        const translationMatrix = mat4(
                                1, 0, 0, 0,
                                0, 1, 0, 0,
                                0, 0, 1, 0,
                                pos.x, pos.y, 0, 1
                        )
                        const instanceMatrix = translationMatrix.mul(rotationMatrix)
                        return projectionMatrix.mul(viewMatrix).mul(instanceMatrix).mul(box)
                }),
        })

        return (
                <Layout noFooter>
                        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%' }}>
                                <canvas ref={gl.ref} />
                        </div>
                </Layout>
        )
}
