import { Fn, Vec2, Float } from '../../node'
import { lineSDF } from '../sdf/lineSDF'
import { fill } from './fill'

export const line = Fn(([st, a, b, thickness]: [Vec2, Vec2, Vec2, Float]): Float => {
        return fill(lineSDF(st, a, b), thickness)
}).setLayout({
        name: 'line',
        type: 'float',
        inputs: [
                { name: 'st', type: 'vec2' },
                { name: 'a', type: 'vec2' },
                { name: 'b', type: 'vec2' },
                { name: 'thickness', type: 'float' },
        ],
})
