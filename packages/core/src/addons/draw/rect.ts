import { Fn, Vec2, Float } from '../../node'
import { rectSDF, rectSDFUniform } from '../sdf/rectSDF'
import { fill } from './fill'
import { stroke } from './stroke'

// Rectangle with stroke using vec2 size
export const rectStroke = Fn(([st, size, strokeWidth]: [Vec2, Vec2, Float]): Float => {
	return stroke(rectSDF(st, size), 1, strokeWidth)
}).setLayout({
	name: 'rectStroke',
	type: 'float',
	inputs: [
		{ name: 'st', type: 'vec2' },
		{ name: 'size', type: 'vec2' },
		{ name: 'strokeWidth', type: 'float' },
	],
})

// Rectangle with stroke using uniform size
export const rectStrokeUniform = Fn(([st, size, strokeWidth]: [Vec2, Float, Float]): Float => {
	return stroke(rectSDFUniform(st, size), 1, strokeWidth)
}).setLayout({
	name: 'rectStrokeUniform',
	type: 'float',
	inputs: [
		{ name: 'st', type: 'vec2' },
		{ name: 'size', type: 'float' },
		{ name: 'strokeWidth', type: 'float' },
	],
})

// Filled rectangle using vec2 size
export const rectFill = Fn(([st, size]: [Vec2, Vec2]): Float => {
	return fill(rectSDF(st, size), 1)
}).setLayout({
	name: 'rectFill',
	type: 'float',
	inputs: [
		{ name: 'st', type: 'vec2' },
		{ name: 'size', type: 'vec2' },
	],
})

// Filled rectangle using uniform size
export const rectFillUniform = Fn(([st, size]: [Vec2, Float]): Float => {
	return fill(rectSDFUniform(st, size), 1)
}).setLayout({
	name: 'rectFillUniform',
	type: 'float',
	inputs: [
		{ name: 'st', type: 'vec2' },
		{ name: 'size', type: 'float' },
	],
})

// Default rect function (filled with vec2 size)
export const rect = rectFill