import { Fn, Vec2, Float, float, vec2, floor, length, clamp, min, dot, cos, normalize, If } from '../../node'

// Constants
const ARROWS_TILE_SIZE = float(32)
const ARROWS_HEAD_ANGLE = float(0.5)

// Arrow tile center coordinate calculation
export const arrowsTileCenterCoord = Fn(([pos]: [Vec2]): Vec2 => {
        return floor(pos.div(ARROWS_TILE_SIZE)).add(0.5).mul(ARROWS_TILE_SIZE)
}).setLayout({
        name: 'arrowsTileCenterCoord',
        type: 'vec2',
        inputs: [{ name: 'pos', type: 'vec2' }],
})

// Arrows with resolution parameter
export const arrowsWithResolution = Fn(([p, v, resolution]: [Vec2, Vec2, Vec2]): Float => {
        const scaledP = p.mul(resolution).toVar()
        scaledP.subAssign(arrowsTileCenterCoord(scaledP))
        const mag_v = length(v).toVar()

        const result = float(0).toVar()

        If(mag_v.greaterThan(0), () => {
                const dir_v = v.div(mag_v).toVar()
                mag_v.assign(clamp(mag_v, 5, ARROWS_TILE_SIZE.div(2)))
                const vScaled = dir_v.mul(mag_v).toVar()

                // Simplified arrow implementation based on GLSL default style
                const arrow = float(1)
                        .add(
                                min(
                                        float(0),
                                        dot(normalize(vScaled.sub(scaledP)), dir_v).sub(cos(ARROWS_HEAD_ANGLE.div(2)))
                                )
                                        .mul(2)
                                        .mul(length(vScaled.sub(scaledP)))
                                        .add(min(float(0), dot(scaledP, dir_v).add(1)))
                                        .add(
                                                min(
                                                        float(0),
                                                        cos(ARROWS_HEAD_ANGLE.div(2)).sub(
                                                                dot(normalize(vScaled.mul(0.33).sub(scaledP)), dir_v)
                                                        )
                                                )
                                                        .mul(mag_v)
                                                        .mul(0.8)
                                        )
                        )
                        .saturate()
                result.assign(arrow)
        })

        return result
}).setLayout({
        name: 'arrowsWithResolution',
        type: 'float',
        inputs: [
                { name: 'p', type: 'vec2' },
                { name: 'v', type: 'vec2' },
                { name: 'resolution', type: 'vec2' },
        ],
})

// Arrows with default resolution
export const arrows = Fn(([p, v]: [Vec2, Vec2]): Float => {
        return arrowsWithResolution(p, v, vec2(1))
}).setLayout({
        name: 'arrows',
        type: 'float',
        inputs: [
                { name: 'p', type: 'vec2' },
                { name: 'v', type: 'vec2' },
        ],
})
