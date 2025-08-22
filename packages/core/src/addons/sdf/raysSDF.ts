import { Fn, Vec2, Int, Float, atan2, float } from '../../node'

const TAU = 6.283185307179586

export const raysSDF = Fn(([st, N]: [Vec2, Int]): Float => {
        const centered = st.sub(0.5).toVar('centered')
        return atan2(centered.y, centered.x).div(TAU).mul(N.toFloat()).fract()
}).setLayout({
        name: 'raysSDF',
        type: 'float',
        inputs: [
                { name: 'st', type: 'vec2' },
                { name: 'N', type: 'int' },
        ],
})