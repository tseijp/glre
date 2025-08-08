import { Fn, Float, Vec3, Vec4, X, float, vec3, vec4, mix } from '../../node'

// Flip function for float
export const flipFloat = Fn(([v, pct]: [Float, Float]): Float => {
	return mix(v, float(1).sub(v), pct)
}).setLayout({
	name: 'flipFloat',
	type: 'float',
	inputs: [
		{ name: 'v', type: 'float' },
		{ name: 'pct', type: 'float' },
	],
})

// Flip function for vec3
export const flipVec3 = Fn(([v, pct]: [Vec3, Float]): Vec3 => {
	return mix(v, vec3(1).sub(v), pct)
}).setLayout({
	name: 'flipVec3',
	type: 'vec3',
	inputs: [
		{ name: 'v', type: 'vec3' },
		{ name: 'pct', type: 'float' },
	],
})

// Flip function for vec4
export const flipVec4 = Fn(([v, pct]: [Vec4, Float]): Vec4 => {
	return mix(v, vec4(1).sub(v), pct)
}).setLayout({
	name: 'flipVec4',
	type: 'vec4',
	inputs: [
		{ name: 'v', type: 'vec4' },
		{ name: 'pct', type: 'float' },
	],
})

// Generic flip function using auto type
export const flip = Fn(([v, pct]: [X, Float]): X => {
	return mix(v, v.oneMinus(), pct)
}).setLayout({
	name: 'flip',
	type: 'auto',
	inputs: [
		{ name: 'v', type: 'auto' },
		{ name: 'pct', type: 'float' },
	],
})