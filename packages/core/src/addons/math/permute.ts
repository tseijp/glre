import { Fn, X } from '../../node'
import { mod289 } from './mod289'

// Permutation function for procedural noise generation
export const permute = Fn(([v]: [X]): X => {
	return mod289(v.mul(34.0).add(1.0).mul(v))
}).setLayout({
	name: 'permute',
	type: 'auto',
	inputs: [{ name: 'v', type: 'auto' }],
})