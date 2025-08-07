import { Fn, Float, Mat3, mat3, vec3 } from '../../node'

export const rotate3dX = Fn(([r]: [Float]): Mat3 => {
        const c = r.cos()
        const s = r.sin()
        return mat3(
                vec3(1, 0, 0),
                vec3(0, c, s),
                vec3(0, s.negate(), c)
        )
}).setLayout({
        name: 'rotate3dX',
        type: 'mat3',
        inputs: [
                {
                        name: 'r',
                        type: 'float'
                }
        ]
})