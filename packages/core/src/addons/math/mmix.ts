import { Fn, X, mix, max, step, clamp } from '../../node'

// Basic mmix function - wrapper around standard mix
export const mmix = Fn(([a, b, c]: [X, X, X]): X => {
        return mix(a, b, c)
}).setLayout({
        name: 'mmix',
        type: 'auto',
        inputs: [
                { name: 'a', type: 'auto' },
                { name: 'b', type: 'auto' },
                { name: 'c', type: 'auto' },
        ],
})

// Three-value interpolation with percentage control
export const mmix3 = Fn(([a, b, c, pct]: [X, X, X, X]): X => {
        return mix(mix(a, b, pct.mul(2)), mix(b, c, max(pct, 0.5).sub(0.5).mul(2)), step(0.5, pct))
}).setLayout({
        name: 'mmix3',
        type: 'auto',
        inputs: [
                { name: 'a', type: 'auto' },
                { name: 'b', type: 'auto' },
                { name: 'c', type: 'auto' },
                { name: 'pct', type: 'auto' },
        ],
})

// Four-value interpolation with percentage control
export const mmix4 = Fn(([a, b, c, d, pct]: [X, X, X, X, X]): X => {
        return mix(
                mix(a, b, pct.mul(3)),
                mix(b, mix(c, d, max(pct, 0.66).sub(0.66).mul(3)), clamp(pct, 0.33, 0.66).sub(0.33).mul(3)),
                step(0.33, pct)
        )
}).setLayout({
        name: 'mmix4',
        type: 'auto',
        inputs: [
                { name: 'a', type: 'auto' },
                { name: 'b', type: 'auto' },
                { name: 'c', type: 'auto' },
                { name: 'd', type: 'auto' },
                { name: 'pct', type: 'auto' },
        ],
})
