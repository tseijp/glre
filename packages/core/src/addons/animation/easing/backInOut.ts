import { Fn, Float, float, select } from '../../../node'
import { backIn } from './backIn'

export const backInOut = Fn(([t]: [Float]): Float => {
	const f = t.lessThan(0.5).select(t.mul(2), float(1).sub(t.mul(2).sub(1)))
	const g = backIn(f)
	return t.lessThan(0.5).select(g.mul(0.5), float(1).sub(g).mul(0.5).add(0.5))
}).setLayout({
	name: 'backInOut',
	type: 'float',
	inputs: [
		{ name: 't', type: 'float' },
	],
})