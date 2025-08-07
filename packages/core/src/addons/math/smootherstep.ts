import { Fn, X } from '../../node'
import { quintic } from './quintic'

export const smootherstep = Fn(([a, b, v]: [X, X, X]): X => {
	const normalized = v.sub(a).div(b.sub(a)).toVar('normalized')
	const saturated = normalized.saturate().toVar('saturated')
	return quintic(saturated)
}).setLayout({
	name: 'smootherstep',
	type: 'auto',
	inputs: [
		{ name: 'a', type: 'auto' },
		{ name: 'b', type: 'auto' },
		{ name: 'v', type: 'auto' }
	]
})