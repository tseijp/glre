import { Fn, Float, X, mix, smoothstep, float } from '../../node'

export const nyquist = Fn(([x, width]: [X, Float]): X => {
        const cutoffStart = 0.25
        const cutoffEnd = 0.75
        const f = smoothstep(cutoffEnd, cutoffStart, width)
        return mix(float(0.5), x, f)
}).setLayout({
        name: 'nyquist',
        type: 'auto',
        inputs: [
                { name: 'x', type: 'auto' },
                { name: 'width', type: 'float' },
        ],
})
