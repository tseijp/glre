import { Fn, Vec2, Vec3, Float, clamp, dot, length, cross } from '../../node'

// 2D line segment distance function
export const lineSDF2D = Fn(([st, a, b]: [Vec2, Vec2, Vec2]): Float => {
	const b_to_a = b.sub(a)
	const to_a = st.sub(a)
	const h = clamp(dot(to_a, b_to_a).div(dot(b_to_a, b_to_a)), 0, 1)
	return length(to_a.sub(h.mul(b_to_a)))
}).setLayout({
	name: 'lineSDF2D',
	type: 'float',
	inputs: [
		{ name: 'st', type: 'vec2' },
		{ name: 'a', type: 'vec2' },
		{ name: 'b', type: 'vec2' },
	],
})

// 3D line distance function  
export const lineSDF3D = Fn(([p, a, b]: [Vec3, Vec3, Vec3]): Float => {
	return length(cross(p.sub(a), p.sub(b))).div(length(b.sub(a)))
}).setLayout({
	name: 'lineSDF3D',
	type: 'float',
	inputs: [
		{ name: 'p', type: 'vec3' },
		{ name: 'a', type: 'vec3' },
		{ name: 'b', type: 'vec3' },
	],
})

// Unified lineSDF function (defaults to 2D)
export const lineSDF = lineSDF2D