import { Fn, int, iTime, ivec2, mod, position, sampler2D, uniform, useGL, uv, vec4 } from 'glre/src/react'

const data = uniform(sampler2D(), 'data')

const compute = Fn(([position]) => {
        const coord = position.xy.toIvec2().toVar('coord')
        const texSize = data.textureSize(int(0)).toVec2().toVar('texSize')
        const index = texSize.x.toInt().mul(coord.y).add(coord.x).toFloat().toVar('index')
        const t = index.mul(0.1).add(iTime).toVar('t')
        const result = t.sin().mul(0.5).add(0.5).toVar('result')
        return vec4(result, 0.0, 0.0, 1.0)
})

const fragment = Fn(([uv]) => {
        const texSize = data.textureSize(int(0)).toVec2().toVar('texSize')
        const totalElements = texSize.x.mul(texSize.y).toVar('totalElements')
        const indexFloat = uv.x.mul(totalElements).toVar('indexFloat')
        const index = mod(indexFloat, totalElements).toInt().toVar('index')
        const y = index.div(texSize.x.toInt()).toInt().toVar('y')
        const x = mod(index, texSize.x.toInt()).toInt().toVar('x')
        const coord = ivec2(x, y).toVar('coord')
        const value = data.texelFetch(coord, int(0)).x.toVar('value')
        return vec4(value, value.mul(0.5), value.oneMinus(), 1.0)
})

export default function () {
        const gl = useGL({
                isWebGL: true,
                cs: compute(position),
                fs: fragment(uv),
        })

        gl.storage(data.props.id, new Float32Array(1024))

        return <canvas ref={gl.ref} />
}
