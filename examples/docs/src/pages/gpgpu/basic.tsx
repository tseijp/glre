import { Fn, id, storage, uv, vec2, vec4, Vec2, UVec3 } from 'glre/src/node'
import { useGL } from 'glre/src/react'

const size = Math.pow(2, 4)
const particles = size * size

const data = storage(vec2())

const cs = Fn(([id]: [UVec3]) => {
        const index = id.x.toFloat().toVar()
        const x = index.mod(size)
        const y = index.div(size)
        const color = vec2(x, y).div(size)
        data.element(id.x).assign(color)
})

const fs = Fn(([uv]: [Vec2]) => {
        const x = uv.x.mul(size).floor()
        const y = uv.y.mul(size).floor()
        const index = y.mul(size).add(x)
        const color = data.element(index.toUInt())
        return vec4(color, 0, 1)
})

export default function GPGPUBasicApp() {
        const gl = useGL({
                particles,
                isWebGL: false,
                cs: cs(id),
                fs: fs(uv),
        })

        gl.storage(data.props.id, new Float32Array(gl.particles * 2))

        return <canvas ref={gl.ref} />
}
