import { Fn, Float, sin, pow, float } from '../../../node'
import { HALF_PI } from '../../math/const'

export const elasticIn = Fn(([t]: [Float]): Float => {
	return sin(t.mul(13).mul(HALF_PI)).mul(pow(float(2), t.sub(1).mul(10)))
}).setLayout({
	name: 'elasticIn',
	type: 'float',
	inputs: [
		{ name: 't', type: 'float' },
	],
})