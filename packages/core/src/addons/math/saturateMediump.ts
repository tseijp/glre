import { Fn, X, float } from '../../node'

const MEDIUMP_FLT_MAX = float(65504.0)

export const saturateMediump = Fn(([x]: [X]): X => {
	return x.min(MEDIUMP_FLT_MAX)
}).setLayout({
	name: 'saturateMediump',
	type: 'auto',
	inputs: [{ name: 'x', type: 'auto' }],
})