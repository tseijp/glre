import { Fn, Vec2, Int, Float, atan2 } from '../../node'

export const flowerSDF = Fn(([st, N]: [Vec2, Int]): Float => {
        const centered = st.sub(0.5).mul(4).toVar('centered')
        const r = centered.length().mul(2).toVar('r')
        const a = atan2(centered.y, centered.x).toVar('a')
        const v = N.toFloat().mul(0.5).toVar('v')
        return a.mul(v).cos().abs().mul(0.5).add(0.5).div(r).oneMinus()
}).setLayout({
        name: 'flowerSDF',
        type: 'float',
        inputs: [
                { name: 'st', type: 'vec2' },
                { name: 'N', type: 'int' },
        ],
})
