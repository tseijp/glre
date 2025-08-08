import { Fn, Float, sin, float } from '../../../node'

export const sineIn = Fn(([t]: [Float]): Float => {
	const halfPi = float(1.5707963267948966)
	return sin(t.sub(1).mul(halfPi)).add(1)
}).setLayout({
	name: 'sineIn',
	type: 'float',
	inputs: [
		{ name: 't', type: 'float' },
	],
})