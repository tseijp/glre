import { Fn, Vec2, Float, atan2 } from '../../node'

export const spiralSDF = Fn(([st, t]: [Vec2, Float]): Float => {
        const centeredSt = st.sub(0.5).toVar('centeredSt')
        const r = centeredSt.dot(centeredSt).toVar('r')
        const a = atan2(centeredSt.y, centeredSt.x).toVar('a')
        return r.log().mul(t).add(a.mul(0.159)).fract().sin().abs()
}).setLayout({
        name: 'spiralSDF',
        type: 'float',
        inputs: [
                { name: 'st', type: 'vec2' },
                { name: 't', type: 'float' },
        ],
})
