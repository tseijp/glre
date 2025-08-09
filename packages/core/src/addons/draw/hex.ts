import { Fn, Vec2, Float } from '../../node'
import { hexSDF } from '../sdf/hexSDF'
import { fill } from './fill'
import { stroke } from './stroke'

export const hexFill = Fn(([st, size]: [Vec2, Float]): Float => {
        return fill(hexSDF(st), size)
}).setLayout({
        name: 'hexFill',
        type: 'float',
        inputs: [
                { name: 'st', type: 'vec2' },
                { name: 'size', type: 'float' },
        ],
})

export const hexStroke = Fn(([st, size, strokeWidth]: [Vec2, Float, Float]): Float => {
        return stroke(hexSDF(st), size, strokeWidth)
}).setLayout({
        name: 'hexStroke',
        type: 'float',
        inputs: [
                { name: 'st', type: 'vec2' },
                { name: 'size', type: 'float' },
                { name: 'strokeWidth', type: 'float' },
        ],
})

export const hex = hexFill
