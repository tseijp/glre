import { Fn, Float, sin, pow, float } from '../../../node'

export const elasticIn = Fn(([t]: [Float]): Float => {
	const halfPi = float(1.5707963267948966)
	return sin(t.mul(13).mul(halfPi)).mul(pow(float(2), t.sub(1).mul(10)))
}).setLayout({
	name: 'elasticIn',
	type: 'float',
	inputs: [
		{ name: 't', type: 'float' },
	],
})