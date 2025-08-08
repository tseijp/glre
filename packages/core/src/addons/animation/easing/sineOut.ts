import { Fn, Float, sin, float } from '../../../node'

export const sineOut = Fn(([t]: [Float]): Float => {
	const halfPi = float(1.5707963267948966)
	return sin(t.mul(halfPi))
}).setLayout({
	name: 'sineOut',
	type: 'float',
	inputs: [
		{ name: 't', type: 'float' },
	],
})