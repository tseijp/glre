import { Fn, Float, cos, float } from '../../../node'

export const sineInOut = Fn(([t]: [Float]): Float => {
	const pi = float(3.1415926535897932)
	return cos(pi.mul(t)).sub(1).mul(-0.5)
}).setLayout({
	name: 'sineInOut',
	type: 'float',
	inputs: [
		{ name: 't', type: 'float' },
	],
})