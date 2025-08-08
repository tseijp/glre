import { Fn, Float, float } from '../../../node'
import { bounceOut } from './bounceOut'

export const bounceIn = Fn(([t]: [Float]): Float => {
	return float(1).sub(bounceOut(float(1).sub(t)))
}).setLayout({
	name: 'bounceIn',
	type: 'float',
	inputs: [
		{ name: 't', type: 'float' },
	],
})