import { Fn, Vec2 } from '../../node'

export const aspect = Fn(([st, s]: [Vec2, Vec2]): Vec2 => {
        const result = st.toVar('result')
        result.x.assign(result.x.mul(s.x.div(s.y)))
        return result
}).setLayout({
        name: 'aspect',
        type: 'vec2',
        inputs: [
                { name: 'st', type: 'vec2' },
                { name: 's', type: 'vec2' }
        ]
})