import { Fn, X, float } from '../../node'

export const invCubic = Fn(([v]: [X]): X => {
        return float(0.5).sub(float(1).sub(float(2).mul(v)).asin().div(3).sin())
}).setLayout({
        name: 'invCubic',
        type: 'auto',
        inputs: [
                { name: 'v', type: 'auto' }
        ]
})