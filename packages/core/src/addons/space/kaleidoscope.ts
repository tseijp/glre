import { Fn, Vec2, Float, vec2, float, length, atan2, floor, min, max, cos, sin } from '../../node'
import { TWO_PI } from '../math/constant'

const kaleidoscopeCore = (coord: Vec2, segmentCount: Float, phase: Float) => {
        const uv = coord.sub(0.5).toVar('uv')
        const radius = length(uv).toVar('radius')
        const angle = atan2(uv.y, uv.x).toVar('angle')
        const segmentAngle = float(TWO_PI).div(segmentCount).toVar('segmentAngle')
        const adjustedAngle = angle.sub(segmentAngle.mul(floor(angle.div(segmentAngle)))).toVar('adjustedAngle')
        const finalAngle = min(adjustedAngle, segmentAngle.sub(adjustedAngle)).toVar('finalAngle')
        const kuv = vec2(cos(finalAngle.add(phase)), sin(finalAngle.add(phase)))
                .mul(radius)
                .add(0.5)
                .toVar('kuv')
        return max(min(kuv, kuv.mul(-1).add(2)), kuv.negate())
}

export const kaleidoscope = Fn(([coord, segmentCount, phase]: [Vec2, Float, Float]): Vec2 => {
        return kaleidoscopeCore(coord, segmentCount, phase)
}).setLayout({
        name: 'kaleidoscope',
        type: 'vec2',
        inputs: [
                { name: 'coord', type: 'vec2' },
                { name: 'segmentCount', type: 'float' },
                { name: 'phase', type: 'float' },
        ],
})

export const kaleidoscopeDefault = Fn(([coord]: [Vec2]): Vec2 => {
        return kaleidoscopeCore(coord, float(8), float(0))
}).setLayout({
        name: 'kaleidoscopeDefault',
        type: 'vec2',
        inputs: [{ name: 'coord', type: 'vec2' }],
})

export const kaleidoscopeCount = Fn(([coord, segmentCount]: [Vec2, Float]): Vec2 => {
        return kaleidoscopeCore(coord, segmentCount, float(0))
}).setLayout({
        name: 'kaleidoscopeCount',
        type: 'vec2',
        inputs: [
                { name: 'coord', type: 'vec2' },
                { name: 'segmentCount', type: 'float' },
        ],
})
