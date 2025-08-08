import { Fn, Float, pow, sin } from '../../../node'

export const backIn = Fn(([t]: [Float]): Float => {
	return pow(t, 3).sub(t.mul(sin(t.mul(3.14159))))
}).setLayout({
	name: 'backIn',
	type: 'float',
	inputs: [
		{ name: 't', type: 'float' },
	],
})