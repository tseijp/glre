import { Fn, Vec2, Vec3, vec3, cos, sin, sqrt, float } from '../../node'
import { PI, TWO_PI } from '../math/const'

export const equirect2xyz = Fn(([uv]: [Vec2]): Vec3 => {
        const phi = PI.sub(uv.y.mul(PI)).toVar('phi')
        const theta = uv.x.mul(TWO_PI).toVar('theta')
        const dir = vec3(cos(theta), 0, sin(theta)).toVar('dir')
        dir.y.assign(cos(phi))
        const multiplier = sqrt(float(1).sub(dir.y.mul(dir.y))).toVar('multiplier')
        dir.x.assign(dir.x.mul(multiplier))
        dir.z.assign(dir.z.mul(multiplier))
        return dir
}).setLayout({
        name: 'equirect2xyz',
        type: 'vec3',
        inputs: [{ name: 'uv', type: 'vec2' }],
})
