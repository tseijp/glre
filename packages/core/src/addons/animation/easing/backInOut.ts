import { Fn, Float, float } from '../../../node'
import { backIn } from './backIn'

export const backInOut = Fn(([t]: [Float]): Float => {
	const f = t.mul(2).select(float(1).sub(t.mul(2).sub(1)), t.lessThan(0.5))
	const g = backIn(f)
	return g.mul(0.5).select(float(1).sub(g).mul(0.5).add(0.5), t.lessThan(0.5))
}).setLayout({
	name: 'backInOut',
	type: 'float',
	inputs: [
		{ name: 't', type: 'float' },
	],
})