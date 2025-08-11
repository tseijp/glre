import { Fn, Vec2, vec2 } from '../../node'

export const unratio = Fn(([st, s]: [Vec2, Vec2]): Vec2 => {
        return vec2(st.x, st.y.mul(s.x.div(s.y)).add(s.y.mul(0.5).sub(s.x.mul(0.5)).div(s.y)))
}).setLayout({
        name: 'unratio',
        type: 'vec2',
        inputs: [
                { name: 'st', type: 'vec2' },
                { name: 's', type: 'vec2' },
        ],
})
