import { Fn, Vec2, Int, Float, atan2 } from '../../node'
import { TAU } from '../math/const'

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
