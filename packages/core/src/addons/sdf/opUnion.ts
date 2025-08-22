import { Fn, Float, Vec4, vec4 } from '../../node'

export const opUnion = Fn(([d1, d2]: [Float, Float]): Float => {
        return d1.min(d2)
}).setLayout({
        name: 'opUnion',
        type: 'float',
        inputs: [
                { name: 'd1', type: 'float' },
                { name: 'd2', type: 'float' },
        ],
})

export const opUnionSmooth = Fn(([d1, d2, k]: [Float, Float, Float]): Float => {
        const h = d2.sub(d1).div(k).mul(0.5).add(0.5).clamp(0, 1).toVar('h')
        return d2.mix(d1, h).sub(k.mul(h).mul(h.oneMinus()))
}).setLayout({
        name: 'opUnionSmooth',
        type: 'float',
        inputs: [
                { name: 'd1', type: 'float' },
                { name: 'd2', type: 'float' },
                { name: 'k', type: 'float' },
        ],
})

export const opUnionSmoothVec4 = Fn(([d1, d2, k]: [Vec4, Vec4, Float]): Vec4 => {
        const h = d2.w.sub(d1.w).div(k).mul(0.5).add(0.5).clamp(0, 1).toVar('h')
        const result = d2.mix(d1, h).toVar('result')
        return vec4(result.xyz, result.w.sub(k.mul(h).mul(h.oneMinus())))
}).setLayout({
        name: 'opUnionSmoothVec4',
        type: 'vec4',
        inputs: [
                { name: 'd1', type: 'vec4' },
                { name: 'd2', type: 'vec4' },
                { name: 'k', type: 'float' },
        ],
})
