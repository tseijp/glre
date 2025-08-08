import { Fn, Float, sin, pow, float, select } from '../../../node'

export const elasticInOut = Fn(([t]: [Float]): Float => {
	const halfPi = float(1.5707963267948966)
	const t2 = t.mul(2)
	const t2minus1 = t2.sub(1)
	
	return t.lessThan(0.5).select(
		sin(halfPi.mul(13).mul(t2)).mul(pow(float(2), t2minus1.mul(10))).mul(0.5),
		sin(halfPi.mul(-13).mul(t2minus1.add(1))).mul(pow(float(2), t2minus1.mul(-10))).mul(0.5).add(1)
	)
}).setLayout({
	name: 'elasticInOut',
	type: 'float',
	inputs: [
		{ name: 't', type: 'float' },
	],
})