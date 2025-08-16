import { Fn, Float, length, vec2, dFdx, dFdy, smoothstep } from '../../node'

export const aastep = Fn(([threshold, value]: [Float, Float]): Float => {
        const derivative = vec2(dFdx(value), dFdy(value))
        const afwidth = length(derivative).mul(0.7)
        return smoothstep(threshold.sub(afwidth), threshold.add(afwidth), value)
}).setLayout({
        name: 'aastep',
        type: 'float',
        inputs: [
                { name: 'threshold', type: 'float' },
                { name: 'value', type: 'float' },
        ],
})
