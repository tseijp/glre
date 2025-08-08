import { Fn, Float, Vec3, min, vec3, X } from '../../../node'

// Float version
export const blendAddFloat = Fn(([base, blend]: [Float, Float]): Float => {
	return min(base.add(blend), 1)
}).setLayout({
	name: 'blendAdd',
	type: 'float',
	inputs: [
		{ name: 'base', type: 'float' },
		{ name: 'blend', type: 'float' },
	],
})

// Vec3 version
export const blendAddVec3 = Fn(([base, blend]: [Vec3, Vec3]): Vec3 => {
	return min(base.add(blend), vec3(1))
}).setLayout({
	name: 'blendAdd',
	type: 'vec3',
	inputs: [
		{ name: 'base', type: 'vec3' },
		{ name: 'blend', type: 'vec3' },
	],
})

// Vec3 with opacity version
export const blendAddVec3Opacity = Fn(([base, blend, opacity]: [Vec3, Vec3, Float]): Vec3 => {
	const blended = min(base.add(blend), vec3(1))
	return blended.mul(opacity).add(base.mul(opacity.oneMinus()))
}).setLayout({
	name: 'blendAdd',
	type: 'vec3',
	inputs: [
		{ name: 'base', type: 'vec3' },
		{ name: 'blend', type: 'vec3' },
		{ name: 'opacity', type: 'float' },
	],
})

// Auto-typed version
export const blendAdd = Fn(([base, blend]: [X, X]): X => {
	return min(base.add(blend), base.mul(0).add(1))
}).setLayout({
	name: 'blendAdd',
	type: 'auto',
	inputs: [
		{ name: 'base', type: 'auto' },
		{ name: 'blend', type: 'auto' },
	],
})