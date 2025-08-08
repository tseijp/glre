import { Fn, Float, sin, pow, float } from '../../../node'
import { HALF_PI } from '../../math/const'

export const elasticInOut = Fn(([t]: [Float]): Float => {
	const t2 = t.mul(2)
	const t2minus1 = t2.sub(1)
	
	return sin(HALF_PI.mul(13).mul(t2)).mul(pow(float(2), t2minus1.mul(10))).mul(0.5).select(
		sin(HALF_PI.mul(-13).mul(t2minus1.add(1))).mul(pow(float(2), t2minus1.mul(-10))).mul(0.5).add(1),
		t.lessThan(0.5)
	)
}).setLayout({
	name: 'elasticInOut',
	type: 'float',
	inputs: [
		{ name: 't', type: 'float' },
	],
})