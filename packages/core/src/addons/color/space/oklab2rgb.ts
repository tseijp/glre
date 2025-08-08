import { Fn, mat3, vec4, Vec3, Vec4 } from '../../../node'

const OKLAB2RGB_A = mat3(
        1.0,
        1.0,
        1.0,
        0.3963377774,
        -0.1055613458,
        -0.0894841775,
        0.2158037573,
        -0.0638541728,
        -1.291485548
)

const OKLAB2RGB_B = mat3(
        4.0767416621,
        -1.2684380046,
        -0.0041960863,
        -3.3077115913,
        2.6097574011,
        -0.7034186147,
        0.2309699292,
        -0.3413193965,
        1.707614701
)

export const oklab2rgb3 = Fn(([oklab]: [Vec3]): Vec3 => {
        const lms = OKLAB2RGB_A.mul(oklab)
        return OKLAB2RGB_B.mul(lms.mul(lms).mul(lms))
}).setLayout({
        name: 'oklab2rgb3',
        type: 'vec3',
        inputs: [
                {
                        name: 'oklab',
                        type: 'vec3',
                },
        ],
})

export const oklab2rgb4 = Fn(([oklab]: [Vec4]): Vec4 => {
        const rgb = oklab2rgb3(oklab.xyz)
        return vec4(rgb, oklab.w)
}).setLayout({
        name: 'oklab2rgb4',
        type: 'vec4',
        inputs: [
                {
                        name: 'oklab',
                        type: 'vec4',
                },
        ],
})

export const oklab2rgb = oklab2rgb3
