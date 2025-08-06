import { Fn, X, Float, Mat2, Mat3, Mat4, mat2, mat3, mat4, int, float } from '../../node'

export const inverse = Fn(([m]: [X]): X => {
        return float(1).div(m)
}).setLayout({
        name: 'reciprocal',
        type: 'auto',
        inputs: [
                {
                        name: 'm',
                        type: 'auto'
                }
        ]
})