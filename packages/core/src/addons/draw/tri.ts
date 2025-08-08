import { Fn, Vec2, Float } from '../../node'
import { triSDF } from '../sdf/triSDF'
import { fill } from './fill'
import { stroke } from './stroke'

// Filled triangle
export const triFill = Fn(([st, size]: [Vec2, Float]): Float => {
	return fill(triSDF(st), size)
}).setLayout({
	name: 'triFill',
	type: 'float',
	inputs: [
		{ name: 'st', type: 'vec2' },
		{ name: 'size', type: 'float' },
	],
})

// Stroked triangle
export const triStroke = Fn(([st, size, strokeWidth]: [Vec2, Float, Float]): Float => {
	return stroke(triSDF(st), size, strokeWidth)
}).setLayout({
	name: 'triStroke',
	type: 'float',
	inputs: [
		{ name: 'st', type: 'vec2' },
		{ name: 'size', type: 'float' },
		{ name: 'strokeWidth', type: 'float' },
	],
})

// Default tri function (filled)
export const tri = triFill