import { Fn, Vec2, Float, float } from '../../node'
import { rectSDF, rectSDFUniform } from '../sdf/rectSDF'
import { fill } from './fill'
import { stroke } from './stroke'

export const rectStroke = Fn(([st, size, strokeWidth]: [Vec2, Vec2, Float]): Float => {
        return stroke(rectSDF(st, size), float(1), strokeWidth)
}).setLayout({
        name: 'rectStroke',
        type: 'float',
        inputs: [
                { name: 'st', type: 'vec2' },
                { name: 'size', type: 'vec2' },
                { name: 'strokeWidth', type: 'float' },
        ],
})

export const rectStrokeUniform = Fn(([st, size, strokeWidth]: [Vec2, Float, Float]): Float => {
        return stroke(rectSDFUniform(st, size), float(1), strokeWidth)
}).setLayout({
        name: 'rectStrokeUniform',
        type: 'float',
        inputs: [
                { name: 'st', type: 'vec2' },
                { name: 'size', type: 'float' },
                { name: 'strokeWidth', type: 'float' },
        ],
})

export const rectFill = Fn(([st, size]: [Vec2, Vec2]): Float => {
        return fill(rectSDF(st, size), float(1))
}).setLayout({
        name: 'rectFill',
        type: 'float',
        inputs: [
                { name: 'st', type: 'vec2' },
                { name: 'size', type: 'vec2' },
        ],
})

export const rectFillUniform = Fn(([st, size]: [Vec2, Float]): Float => {
        return fill(rectSDFUniform(st, size), float(1))
}).setLayout({
        name: 'rectFillUniform',
        type: 'float',
        inputs: [
                { name: 'st', type: 'vec2' },
                { name: 'size', type: 'float' },
        ],
})

export const rect = rectFill
