import { Fn, Vec2, Float, mat2, atan2, cos, sin, mod, vec2, float } from '../../node'
import { PI, TWO_PI } from '../math/const'

const BRACKETING_ANGLE_DELTA = PI.div(20.0)

export const bracketingAxis0 = Fn(([dir]: [Vec2]): Vec2 => {
        const angle = atan2(dir.y, dir.x).add(TWO_PI)
        const fractional = mod(angle, BRACKETING_ANGLE_DELTA)
        const angle0 = angle.sub(fractional)
        return vec2(cos(angle0), sin(angle0))
}).setLayout({
        name: 'bracketingAxis0',
        type: 'vec2',
        inputs: [{ name: 'dir', type: 'vec2' }],
})

export const bracketingAxis1 = Fn(([dir]: [Vec2]): Vec2 => {
        const angle = atan2(dir.y, dir.x).add(TWO_PI)
        const fractional = mod(angle, BRACKETING_ANGLE_DELTA)
        const angle0 = angle.sub(fractional)
        const vAxis0 = vec2(cos(angle0), sin(angle0))
        const RotateByAngleDelta = mat2(
                cos(BRACKETING_ANGLE_DELTA),
                sin(BRACKETING_ANGLE_DELTA),
                sin(BRACKETING_ANGLE_DELTA).negate(),
                cos(BRACKETING_ANGLE_DELTA)
        )
        return RotateByAngleDelta.mul(vAxis0)
}).setLayout({
        name: 'bracketingAxis1',
        type: 'vec2',
        inputs: [{ name: 'dir', type: 'vec2' }],
})

export const bracketingBlend = Fn(([dir]: [Vec2]): Float => {
        const angle = atan2(dir.y, dir.x).add(TWO_PI)
        const fractional = mod(angle, BRACKETING_ANGLE_DELTA)
        return fractional.div(BRACKETING_ANGLE_DELTA)
}).setLayout({
        name: 'bracketingBlend',
        type: 'float',
        inputs: [{ name: 'dir', type: 'vec2' }],
})
