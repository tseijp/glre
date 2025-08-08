import { Fn, Vec2, Vec3, Vec4, Float, vec2, vec3, vec4 } from '../../node'
import { circleFill } from './circle'

// Simple point rendering (circle at position with color and radius)
export const point2D = Fn(([st, pos, color, radius]: [Vec2, Vec2, Vec3, Float]): Vec4 => {
	const st_p = st.sub(pos)
	const circle = circleFill(st_p.add(0.5), radius)
	return vec4(color, 1).mul(circle)
}).setLayout({
	name: 'point2D',
	type: 'vec4',
	inputs: [
		{ name: 'st', type: 'vec2' },
		{ name: 'pos', type: 'vec2' },
		{ name: 'color', type: 'vec3' },
		{ name: 'radius', type: 'float' },
	],
})

// Simple point with default red color and radius
export const pointSimple = Fn(([st, pos]: [Vec2, Vec2]): Vec4 => {
	return point2D(st, pos, vec3(1, 0, 0), 0.02)
}).setLayout({
	name: 'pointSimple',
	type: 'vec4',
	inputs: [
		{ name: 'st', type: 'vec2' },
		{ name: 'pos', type: 'vec2' },
	],
})

// Default point function
export const point = pointSimple