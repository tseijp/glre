import { Fn, Vec2, Float, vec2 } from '../../node'

export const heartSDF = Fn(([st]: [Vec2]): Float => {
        const centered = st.sub(0.5).sub(vec2(0, 0.3)).toVar('centered')
        const r = centered.length().mul(5).toVar('r')
        const normalized = centered.normalize().toVar('normalized')
        const shape = normalized.y
                .mul(normalized.x.abs().pow(0.67))
                .div(normalized.y.add(1.5))
                .sub(normalized.y.mul(2))
                .add(1.26)
        return r.sub(shape)
}).setLayout({
        name: 'heartSDF',
        type: 'float',
        inputs: [{ name: 'st', type: 'vec2' }],
})
