import { Fn, Float, Vec2, X, dFdx, dFdy, fract, length, mix, smoothstep, vec2, select, float } from '../../node'

const nyquist = Fn(([x, width]: [Float, Float]): Float => {
        const cutoffStart = float(0.25).toVar('cutoffStart') // NYQUIST_FILTER_CENTER - NYQUIST_FILTER_WIDTH
        const cutoffEnd = float(0.75).toVar('cutoffEnd') // NYQUIST_FILTER_CENTER + NYQUIST_FILTER_WIDTH
        const f = smoothstep(cutoffEnd, cutoffStart, width).toVar('f')
        return mix(float(0.5), x, f)
}).setLayout({
        name: 'nyquist',
        type: 'float',
        inputs: [
                { name: 'x', type: 'float' },
                { name: 'width', type: 'float' },
        ],
})

export const aafract = Fn(([x]: [X]): X => {
        const afwidth = length(vec2(dFdx(x), dFdy(x)))
                .mul(2)
                .toVar('afwidth')
        const fx = fract(x).toVar('fx')
        const idx = afwidth.oneMinus().toVar('idx')
        const v = select(fx.div(idx as any), fx.oneMinus().div(afwidth as any), fx.lessThan(idx as any)).toVar('v')
        return nyquist(v as any, afwidth as any)
}).setLayout({
        name: 'aafract',
        type: 'auto',
        inputs: [{ name: 'x', type: 'auto' }],
})

// Vector overloads
export const aafractVec2 = Fn(([v]: [Vec2]): Vec2 => {
        return vec2(aafract(v.x), aafract(v.y))
}).setLayout({
        name: 'aafractVec2',
        type: 'vec2',
        inputs: [{ name: 'v', type: 'vec2' }],
})
