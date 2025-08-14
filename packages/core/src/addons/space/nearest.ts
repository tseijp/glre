import { Fn, Vec2, floor } from '../../node'

export const nearest = Fn(([v, res]: [Vec2, Vec2]): Vec2 => {
        const offset = res.sub(1).reciprocal().mul(0.5).toVar('offset')
        return floor(v.mul(res)).div(res).add(offset)
}).setLayout({
        name: 'nearest',
        type: 'vec2',
        inputs: [
                { name: 'v', type: 'vec2' },
                { name: 'res', type: 'vec2' },
        ],
})
