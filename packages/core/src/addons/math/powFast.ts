import { Fn, X, Float, float } from '../../node'

export const powFast = Fn(([a, b]: [X, X]): X => {
        return a.div((float(1) as any).sub(b).mul(a).add(b))
}).setLayout({
        name: 'powFast',
        type: 'auto',
        inputs: [
                { name: 'a', type: 'auto' },
                { name: 'b', type: 'auto' },
        ],
})
