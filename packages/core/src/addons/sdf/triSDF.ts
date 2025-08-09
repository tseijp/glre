import { Fn, Vec2, Float, max, abs, float } from '../../node'

export const triSDF = Fn(([st]: [Vec2]): Float => {
	const normalized = st.sub(0.5).mul(5).toVar()
	const sqrt3_2 = float(0.866025) // sqrt(3)/2
	return max(
		abs(normalized.x).mul(sqrt3_2).add(normalized.y.div(2)),
		normalized.y.div(-2)
	)
}).setLayout({
	name: 'triSDF',
	type: 'float',
	inputs: [{ name: 'st', type: 'vec2' }],
})