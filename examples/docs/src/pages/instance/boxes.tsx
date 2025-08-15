import { useGL } from 'glre/src/react'
import { attribute, uniform, vec4 } from 'glre/src/node'

const col = 4
const row = 4
const instanceCount = col * row

const createProjectionMatrix = (aspect = 1, fov = (2 * Math.PI) / 5, near = 1, far = 100) => {
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

const createInstanceMatrices = () => {
        const step = 4.0
        const matrices = []
        for (let i = 0; i < col; i++)
                for (let j = 0; j < row; j++) {
                        const x = step * (i - col / 2 + 0.5)
                        const y = step * (j - row / 2 + 0.5)
                        const z = 0
                        matrices.push(...createViewMatrix(x, y, z))
                }
        return matrices
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
        const aspect = 800 / 600

        const pos = attribute<'vec4'>(cubePositions) // 144 len
        const mat = attribute<'mat4'>(createInstanceMatrices()) // 256 len

        const projectionMatrix = uniform<'mat4'>(createProjectionMatrix(aspect))
        const viewMatrix = uniform<'mat4'>(createViewMatrix())

        const gl = useGL({
                isWebGL: true,
                instanceCount, // 16
                count: 36,
                vert: projectionMatrix.mul(viewMatrix).mul(mat).mul(pos),
                frag: vec4(0.7, 0.4, 0.9, 1.0),
                // loop() {
                //         const matrices = []
                //         const col = 4
                //         const row = 4
                //         const step = 4.0
                //         const time = iTime.value

                //         for (let x = 0; x < col; x++) {
                //                 for (let y = 0; y < row; y++) {
                //                         const posX = step * (x - col / 2 + 0.5)
                //                         const posY = step * (y - row / 2 + 0.5)
                //                         const posZ = 0

                //                         const rotX = Math.sin((x + 0.5) * time)
                //                         const rotY = Math.cos((y + 0.5) * time)

                //                         const cosX = Math.cos(rotX),
                //                                 sinX = Math.sin(rotX)
                //                         const cosY = Math.cos(rotY),
                //                                 sinY = Math.sin(rotY)

                //                         // prettier-ignore
                //                         matrices.push(
                //                                 cosY, sinX * sinY, cosX * sinY, 0,
                //                                 0, cosX, -sinX, 0,
                //                                 -sinY, sinX * cosY, cosX * cosY, 0,
                //                                 posX, posY, posZ, 1
                //                         )
                //                 }
                //         }
                //         // gl.attribute(mat.id, matrices)
                // },
        })

        return <canvas ref={gl.ref} width={800} height={600} />
}
