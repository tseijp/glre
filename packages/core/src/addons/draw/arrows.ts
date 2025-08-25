import { Fn, Float, Vec2, float, vec2, length, clamp, min, step, If } from '../../node'
import { lineSDF } from '../sdf/lineSDF'

const ARROWS_TILE_SIZE = float(32.0)

export const arrowsTileCenterCoord = Fn(([pos]: [Vec2]): Vec2 => {
        const floored = pos.div(ARROWS_TILE_SIZE).floor()
        return floored.add(0.5).mul(ARROWS_TILE_SIZE)
}).setLayout({
        name: 'arrowsTileCenterCoord',
        type: 'vec2',
        inputs: [{ name: 'pos', type: 'vec2' }],
})

export const arrows = Fn(([p, v, resolution]: [Vec2, Vec2, Vec2]): Float => {
        const pScaled = p.mul(resolution).toVar('pScaled')
        pScaled.subAssign(arrowsTileCenterCoord(pScaled))
        const mag_v = length(v).toVar('mag_v')

        If(mag_v.greaterThan(0.0), () => {
                const dir_v = v.div(mag_v).toVar('dir_v')
                mag_v.assign(clamp(mag_v, float(5.0), ARROWS_TILE_SIZE.div(2.0)))
                const vScaled = dir_v.mul(mag_v).toVar('vScaled')

                const shaft = lineSDF(pScaled, vScaled, vScaled.negate()).toVar('shaft')
                const head1 = lineSDF(
                        pScaled,
                        vScaled,
                        vScaled.mul(0.4).add(vec2(vScaled.y.negate(), vScaled.x).mul(0.2))
                ).toVar('head1')
                const head2 = lineSDF(
                        pScaled,
                        vScaled,
                        vScaled.mul(0.4).add(vec2(vScaled.y, vScaled.x.negate()).mul(0.2))
                ).toVar('head2')
                const head = min(head1, head2).toVar('head')

                return step(min(shaft, head), float(1.0))
        })

        return float(0.0)
}).setLayout({
        name: 'arrows',
        type: 'float',
        inputs: [
                { name: 'p', type: 'vec2' },
                { name: 'v', type: 'vec2' },
                { name: 'resolution', type: 'vec2' },
        ],
})

export const arrowsSimple = Fn(([p, v]: [Vec2, Vec2]): Float => {
        return arrows(p, v, vec2(1.0))
}).setLayout({
        name: 'arrowsSimple',
        type: 'float',
        inputs: [
                { name: 'p', type: 'vec2' },
                { name: 'v', type: 'vec2' },
        ],
})
