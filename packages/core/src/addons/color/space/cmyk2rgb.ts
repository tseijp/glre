import { Fn, Vec4, Vec3, float, vec3 } from '../../../node'

export const cmyk2rgb = Fn(([cmyk]: [Vec4]): Vec3 => {
        const invK = float(1).sub(cmyk.w).toVar()
        return float(1)
                .sub(vec3(1).min(cmyk.xyz.mul(invK).add(cmyk.w)))
                .saturate()
}).setLayout({
        name: 'cmyk2rgb',
        type: 'vec3',
        inputs: [{ name: 'cmyk', type: 'vec4' }],
})
