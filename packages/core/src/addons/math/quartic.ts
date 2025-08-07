import { Fn, X, float } from '../../node'

export const quartic = Fn(([v]: [X]): X => {
	const v2 = v.mul(v).toVar('v2')
	return v2.mul((float(2) as any).sub(v2))
}).setLayout({
	name: 'quartic',
	type: 'auto',
	inputs: [
		{
			name: 'v',
			type: 'auto'
		}
	]
})