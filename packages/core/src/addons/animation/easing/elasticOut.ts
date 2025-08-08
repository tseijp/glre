import { Fn, Float, sin, pow, float } from '../../../node'
import { HALF_PI } from '../../math/const'

export const elasticOut = Fn(([t]: [Float]): Float => {
	return sin(float(-13).mul(t.add(1)).mul(HALF_PI)).mul(pow(float(2), float(-10).mul(t))).add(1)
}).setLayout({
	name: 'elasticOut',
	type: 'float',
	inputs: [
		{ name: 't', type: 'float' },
	],
})