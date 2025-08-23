import { Fn, Vec2, Int, Float, vec2, atan2, step, float } from '../../node'
import { TAU } from '../math/const'
import { scale } from '../space/scale'

export function starSDF(st: Vec2, V: Int, s: Float): Float
export function starSDF(st: Vec2, V: Int): Float
export function starSDF(st: Vec2, V: any, s?: any): any {
        if (s !== undefined) {
                return starSDFWithScale(st, V, s)
        } else {
                return starSDFSimple(st, V)
        }
}

export const starSDFWithScale = Fn(([st, V, s]: [Vec2, Int, Float]): Float => {
        const centeredSt = st.sub(0.5).mul(2).toVar('centeredSt')
        const a = atan2(centeredSt.y, centeredSt.x).div(TAU).toVar('a')
        const seg = a.mul(V.toFloat()).toVar('seg')
        const finalA = seg
                .floor()
                .add(0.5)
                .div(V.toFloat())
                .add(s.mix(s.negate(), step(0.5, seg.fract())))
                .mul(TAU)
                .toVar('finalA')
        return vec2(finalA.cos(), finalA.sin()).dot(centeredSt).abs()
}).setLayout({
        name: 'starSDFWithScale',
        type: 'float',
        inputs: [
                { name: 'st', type: 'vec2' },
                { name: 'V', type: 'int' },
                { name: 's', type: 'float' },
        ],
})

export const starSDFSimple = Fn(([st, V]: [Vec2, Int]): Float => {
        const scaledSt = scale(st, V.toFloat().reciprocal().mul(12), vec2(0.5))
        return starSDFWithScale(scaledSt as any, V, float(0.1))
}).setLayout({
        name: 'starSDFSimple',
        type: 'float',
        inputs: [
                { name: 'st', type: 'vec2' },
                { name: 'V', type: 'int' },
        ],
})
