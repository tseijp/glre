import { Fn, Vec2, Float } from '../../node'

export const hexSDF = Fn(([st]: [Vec2]): Float => {
        const transformed = st.mul(2).sub(1).toVar('transformed')
        transformed.assign(transformed.abs())
        return transformed.y.abs().max(transformed.x.mul(0.866025).add(transformed.y.mul(0.5)))
}).setLayout({
        name: 'hexSDF',
        type: 'float',
        inputs: [{ name: 'st', type: 'vec2' }],
})
