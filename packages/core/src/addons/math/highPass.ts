import { Fn, Float, max, float } from '../../node'

export const highPass = Fn(([v, b]: [Float, Float]): Float => {
        return max(v.sub(b), 0).div(float(1).sub(b))
}).setLayout({
        name: 'highPass',
        type: 'float',
        inputs: [
                { name: 'v', type: 'float' },
                { name: 'b', type: 'float' },
        ],
})