import { Fn, X, sin } from '../../../node'
import { HALF_PI } from '../../math/const'

export const sineIn = Fn(([t]: [X]): X => {
	return sin(t.sub(1).mul(HALF_PI as any)).add(1)
}).setLayout({
	name: 'sineIn',
	type: 'auto',
	inputs: [{ name: 't', type: 'auto' }],
})