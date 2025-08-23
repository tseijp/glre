import { Fn, Vec2, Float } from '../../node'

export const triSDF = Fn(([st]: [Vec2]): Float => {
        const centered = st.sub(0.5).mul(5).toVar('centered')
        return centered.x.abs().mul(0.866025).add(centered.y.mul(0.5)).max(centered.y.negate().mul(0.5))
}).setLayout({
        name: 'triSDF',
        type: 'float',
        inputs: [{ name: 'st', type: 'vec2' }],
})

export const triSDFCenter = Fn(([st, center]: [Vec2, Vec2]): Float => {
        const centered = st.sub(center).mul(5).toVar('centered')
        return centered.x.abs().mul(0.866025).add(centered.y.mul(0.5)).max(centered.y.negate().mul(0.5))
}).setLayout({
        name: 'triSDFCenter',
        type: 'float',
        inputs: [
                { name: 'st', type: 'vec2' },
                { name: 'center', type: 'vec2' },
        ],
})
