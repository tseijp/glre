import { Fn, Float, sin, pow, float } from '../../../node'

export const elasticOut = Fn(([t]: [Float]): Float => {
	const halfPi = float(1.5707963267948966)
	return sin(t.add(1).mul(-13).mul(halfPi)).mul(pow(float(2), t.mul(-10))).add(1)
}).setLayout({
	name: 'elasticOut',
	type: 'float',
	inputs: [
		{ name: 't', type: 'float' },
	],
})