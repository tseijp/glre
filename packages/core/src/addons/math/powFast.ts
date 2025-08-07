import { Fn, X, float } from '../../node'

export const powFast = Fn(([a, b]: [X, X]): X => {
        return a.div(float(1).sub(b).mul(a).add(b))
}).setLayout({
        name: 'powFast',
        type: 'auto',
        inputs: [
                {
                        name: 'a',
                        type: 'auto'
                },
                {
                        name: 'b', 
                        type: 'auto'
                }
        ]
})