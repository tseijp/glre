import { Fn, Vec2, Float } from '../../node'
import { circleSDFBasic } from '../sdf/circleSDF'
import { fill } from './fill'
import { stroke } from './stroke'

// Filled circle
export const circleFill = Fn(([st, size]: [Vec2, Float]): Float => {
	return fill(circleSDFBasic(st), size)
}).setLayout({
	name: 'circleFill',
	type: 'float',
	inputs: [
		{ name: 'st', type: 'vec2' },
		{ name: 'size', type: 'float' },
	],
})

// Stroked circle
export const circleStroke = Fn(([st, size, strokeWidth]: [Vec2, Float, Float]): Float => {
	return stroke(circleSDFBasic(st), size, strokeWidth)
}).setLayout({
	name: 'circleStroke',
	type: 'float',
	inputs: [
		{ name: 'st', type: 'vec2' },
		{ name: 'size', type: 'float' },
		{ name: 'strokeWidth', type: 'float' },
	],
})

// Default circle function (filled)
export const circle = circleFill