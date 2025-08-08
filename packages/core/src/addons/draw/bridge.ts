import { Fn, Float, Vec2, Vec3, Vec4, X, float } from '../../node'
import { stroke } from './stroke'

// Bridge effect for float
export const bridgeFloat = Fn(([c, d, s, w]: [Float, Float, Float, Float]): Float => {
	const maskedC = c.mul(float(1).sub(stroke(d, s, w.mul(2))))
	return maskedC.add(stroke(d, s, w))
}).setLayout({
	name: 'bridgeFloat',
	type: 'float',
	inputs: [
		{ name: 'c', type: 'float' },
		{ name: 'd', type: 'float' },
		{ name: 's', type: 'float' },
		{ name: 'w', type: 'float' },
	],
})

// Bridge effect for vec2
export const bridgeVec2 = Fn(([c, d, s, w]: [Vec2, Float, Float, Float]): Vec2 => {
	const strokeMask = stroke(d, s, w.mul(2))
	const maskedC = c.mul(float(1).sub(strokeMask))
	return maskedC.add(strokeMask)
}).setLayout({
	name: 'bridgeVec2',
	type: 'vec2',
	inputs: [
		{ name: 'c', type: 'vec2' },
		{ name: 'd', type: 'float' },
		{ name: 's', type: 'float' },
		{ name: 'w', type: 'float' },
	],
})

// Bridge effect for vec3
export const bridgeVec3 = Fn(([c, d, s, w]: [Vec3, Float, Float, Float]): Vec3 => {
	const strokeMask = stroke(d, s, w.mul(2))
	const maskedC = c.mul(float(1).sub(strokeMask))
	return maskedC.add(strokeMask)
}).setLayout({
	name: 'bridgeVec3',
	type: 'vec3',
	inputs: [
		{ name: 'c', type: 'vec3' },
		{ name: 'd', type: 'float' },
		{ name: 's', type: 'float' },
		{ name: 'w', type: 'float' },
	],
})

// Bridge effect for vec4
export const bridgeVec4 = Fn(([c, d, s, w]: [Vec4, Float, Float, Float]): Vec4 => {
	const strokeMask = stroke(d, s, w.mul(2))
	const maskedC = c.mul(float(1).sub(strokeMask))
	return maskedC.add(strokeMask)
}).setLayout({
	name: 'bridgeVec4',
	type: 'vec4',
	inputs: [
		{ name: 'c', type: 'vec4' },
		{ name: 'd', type: 'float' },
		{ name: 's', type: 'float' },
		{ name: 'w', type: 'float' },
	],
})

// Generic bridge function using auto type
export const bridge = Fn(([c, d, s, w]: [X, Float, Float, Float]): X => {
	const strokeMask = stroke(d, s, w.mul(2))
	const maskedC = c.mul(float(1).sub(strokeMask))
	return maskedC.add(strokeMask)
}).setLayout({
	name: 'bridge',
	type: 'auto',
	inputs: [
		{ name: 'c', type: 'auto' },
		{ name: 'd', type: 'float' },
		{ name: 's', type: 'float' },
		{ name: 'w', type: 'float' },
	],
})