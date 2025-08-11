import { Fn, Float } from '../../node'

export const linearizeDepth = Fn(([depth, near, far]: [Float, Float, Float]): Float => {
        const normalizedDepth = depth.mul(2).sub(1).toVar('normalizedDepth')
        return near
                .mul(far)
                .mul(2)
                .div(far.add(near).sub(normalizedDepth.mul(far.sub(near))))
}).setLayout({
        name: 'linearizeDepth',
        type: 'float',
        inputs: [
                { name: 'depth', type: 'float' },
                { name: 'near', type: 'float' },
                { name: 'far', type: 'float' },
        ],
})
