import { Fn, Vec2, Float, vec2 } from '../../node'
import { triSDF } from './triSDF'

export const rhombSDF = Fn(([st]: [Vec2]): Float => {
        return triSDF(st).max(triSDF(vec2(st.x, st.y.oneMinus())))
}).setLayout({
        name: 'rhombSDF',
        type: 'float',
        inputs: [{ name: 'st', type: 'vec2' }],
})
