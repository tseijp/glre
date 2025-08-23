import { Fn, Vec2, Float, Int, float } from '../../node'
import { mapRange } from '../math'

export const gearSDF = Fn(([st, b, N]: [Vec2, Float, Int]): Float => {
        const e = float(2.71828182845904523536)
        const stCentered = st.sub(0.5).mul(3).toVar('stCentered')
        const s = mapRange(b, float(1), float(15), float(0.066), float(0.5)).toVar('s')
        const d = stCentered.length().sub(s).toVar('d')
        const omega = b.mul(N.toFloat().mul(stCentered.y.atan2(stCentered.x)).sin()).toVar('omega')
        const l = e.pow(omega.mul(2)).toVar('l')
        const hyperTan = l.sub(1).div(l.add(1)).toVar('hyperTan')
        const r = hyperTan.div(b).toVar('r')
        return d.add(d.min(r))
}).setLayout({
        name: 'gearSDF',
        type: 'float',
        inputs: [
                { name: 'st', type: 'vec2' },
                { name: 'b', type: 'float' },
                { name: 'N', type: 'int' },
        ],
})
