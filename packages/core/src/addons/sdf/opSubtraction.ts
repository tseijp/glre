import { Fn, Float, Vec4, vec4, select } from '../../node'

export const opSubtraction = Fn(([d1, d2]: [Float, Float]): Float => {
        return d1.negate().max(d2)
}).setLayout({
        name: 'opSubtraction',
        type: 'float',
        inputs: [
                { name: 'd1', type: 'float' },
                { name: 'd2', type: 'float' }
        ]
})

export const opSubtractionVec4 = Fn(([d1, d2]: [Vec4, Vec4]): Vec4 => {
        return d1.negate().select(d2, d1.w.negate().greaterThan(d2.w))
}).setLayout({
        name: 'opSubtractionVec4',
        type: 'vec4',
        inputs: [
                { name: 'd1', type: 'vec4' },
                { name: 'd2', type: 'vec4' }
        ]
})

export const opSubtractionSmooth = Fn(([d1, d2, k]: [Float, Float, Float]): Float => {
        const h = d2.add(d1).div(k).mul(0.5).sub(0.5).negate().clamp(0, 1).toVar('h')
        return d2.mix(d1.negate(), h).add(k.mul(h).mul(h.oneMinus()))
}).setLayout({
        name: 'opSubtractionSmooth',
        type: 'float',
        inputs: [
                { name: 'd1', type: 'float' },
                { name: 'd2', type: 'float' },
                { name: 'k', type: 'float' }
        ]
})

export const opSubtractionSmoothVec4 = Fn(([d1, d2, k]: [Vec4, Vec4, Float]): Vec4 => {
        const h = d2.w.add(d1.w).div(k).mul(0.5).sub(0.5).negate().clamp(0, 1).toVar('h')
        const result = d2.mix(d1.negate(), h).toVar('result')
        return vec4(result.xyz, result.w.add(k.mul(h).mul(h.oneMinus())))
}).setLayout({
        name: 'opSubtractionSmoothVec4',
        type: 'vec4',
        inputs: [
                { name: 'd1', type: 'vec4' },
                { name: 'd2', type: 'vec4' },
                { name: 'k', type: 'float' }
        ]
})