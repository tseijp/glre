import { Fn, Vec2, Float, abs, max, float } from '../../node'

export const hexSDF = Fn(([st]: [Vec2]): Float => {
	// Transform to centered coordinates [-1, 1]
	const normalized = st.mul(2).sub(1).toVar()
	normalized.assign(abs(normalized))
	
	// Hexagon SDF calculation using geometric properties
	const sqrt3_2 = float(0.866025) // sqrt(3)/2
	return max(
		abs(normalized.y), 
		normalized.x.mul(sqrt3_2).add(normalized.y.mul(0.5))
	)
}).setLayout({
	name: 'hexSDF',
	type: 'float',
	inputs: [{ name: 'st', type: 'vec2' }],
})