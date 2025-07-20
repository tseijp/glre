import { Fn, int, iTime, ivec2, mod, position, sampler2D, uniform, useGL, uv, vec4 } from 'glre/src/react'

const compute = Fn(([position]) => {
        const index = position.y.mul(32).add(position.x).toVar('index')
        const t = index.mul(0.1).add(iTime).toVar('t')
        const result = t.sin().mul(0.5).add(0.5).toVar('result')
        return vec4(result, 0, 0, 1)
})

const texture = uniform(sampler2D(), 'data')

const fragment = Fn(([uv]) => {
        const texSize = texture.textureSize(int(0)).toFloat()
        const indexFloat = uv.x.mul(1024)
        const index = mod(indexFloat, 1024).toInt()
        const y = index.div(texSize.toInt())
        const x = index.sub(y.mul(texSize.toInt()))
        const coord = ivec2(x, y)
        const value = texture.texelFetch(coord, int(0)).r
        return vec4(value, value.mul(0.5), value.oneMinus(), 1.0)
})

export default function () {
        const gl = useGL({
                count: 3,
                isWebGL: true,
                cs: compute(position),
                fs: fragment(uv),
        })

        gl.storage(texture.props.id, new Float32Array(1024))

        return <canvas ref={gl.ref} />
}
