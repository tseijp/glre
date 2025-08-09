import { Fn, Float, Vec4, fract, vec3, vec4, float } from '../../node'

const PackUpscale = float(256.0 / 255.0)
const PackFactors = vec3(256.0 * 256.0 * 256.0, 256.0 * 256.0, 256.0)
const ShiftRight8 = float(1 / 256)

export const pack = Fn(([v]: [Float]): Vec4 => {
        const r = vec4(fract(v.mul(PackFactors)), v).toVar()
        r.yzw.assign(r.yzw.sub(r.xyz.mul(ShiftRight8)))
        return r.mul(PackUpscale)
}).setLayout({
        name: 'pack',
        type: 'vec4',
        inputs: [{ name: 'v', type: 'float' }],
})
