import { Fn, Float, float, select } from '../../../node'

export const bounceOut = Fn(([t]: [Float]): Float => {
	const a = float(4.0 / 11.0)
	const b = float(8.0 / 11.0) 
	const c = float(9.0 / 10.0)
	const ca = float(4356.0 / 361.0)
	const cb = float(35442.0 / 1805.0)
	const cc = float(16061.0 / 1805.0)
	const t2 = t.mul(t)
	
	return t.lessThan(a).select(
		t2.mul(7.5625),
		t.lessThan(b).select(
			t2.mul(9.075).sub(t.mul(9.9)).add(3.4),
			t.lessThan(c).select(
				t2.mul(ca).sub(t.mul(cb)).add(cc),
				t2.mul(10.8).sub(t.mul(20.52)).add(10.72)
			)
		)
	)
}).setLayout({
	name: 'bounceOut',
	type: 'float',
	inputs: [
		{ name: 't', type: 'float' },
	],
})