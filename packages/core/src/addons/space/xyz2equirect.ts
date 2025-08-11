import { Fn, Vec3, Vec2, vec2, atan2, acos } from '../../node'
import { PI, TWO_PI } from '../math/const'

export const xyz2equirect = Fn(([d]: [Vec3]): Vec2 => {
        return vec2(atan2(d.z, d.x).add(PI), acos(d.y.negate())).div(vec2(TWO_PI, PI))
}).setLayout({
        name: 'xyz2equirect',
        type: 'vec2',
        inputs: [{ name: 'd', type: 'vec3' }],
})
