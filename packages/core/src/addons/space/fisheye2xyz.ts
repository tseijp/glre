import { Fn, Vec2, Vec3, vec3, sqrt, cos, float } from '../../node'
import { PI } from '../math/const'

export const fisheye2xyz = Fn(([uv]: [Vec2]): Vec3 => {
        const ndc = uv.mul(2).sub(1).toVar('ndc')
        const R = sqrt(ndc.x.mul(ndc.x).add(ndc.y.mul(ndc.y))).toVar('R')
        const dir = vec3(ndc.x.div(R), 0, ndc.y.div(R)).toVar('dir')
        const phi = R.mul(PI).mul(0.52).toVar('phi')
        dir.y.assign(cos(phi))
        const multiplier = sqrt(float(1).sub(dir.y.mul(dir.y))).toVar('multiplier')
        dir.x.assign(dir.x.mul(multiplier))
        dir.z.assign(dir.z.mul(multiplier))
        return dir
}).setLayout({
        name: 'fisheye2xyz',
        type: 'vec3',
        inputs: [{ name: 'uv', type: 'vec2' }],
})
