import { Fn, iTime, mod, id, storage, uv, vec2, vec4, Vec2, Vec3 } from 'glre/src/node'
import { useGL } from 'glre/src/react'

const data = storage(vec4(), 'data')

const compute = Fn(([id]: [Vec3]) => {
        const index = id.x.toFloat()
        const t = index.mul(0.1).add(iTime).toVar('t')
        const result = t.sin().mul(0.5).add(0.5).toVar('result')
        data.element(index.toInt()).assign(vec4(result, 0.0, 0.0, 1.0))
})

const fragment = Fn(([uv]: [Vec2]) => {
        const texSize = vec2(32.0, 32.0).toVar('texSize')
        const totalElements = texSize.x.mul(texSize.y).toVar('totalElements')
        const indexFloat = uv.x.mul(totalElements).toVar('indexFloat')
        const index = mod(indexFloat, totalElements).toInt().toVar('index')
        const value = data.element(index).toVar('value')
        return vec4(value.x, value.x.mul(0.5), value.x.oneMinus(), 1.0)
})

export default function () {
        const gl = useGL({
                isWebGL: true,
                cs: compute(id),
                fs: fragment(uv),
        })

        gl.storage(data.props.id, new Float32Array(1024))

        return <canvas ref={gl.ref} />
}
