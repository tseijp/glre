import { Fn, Vec3, Vec4, float, vec4, step } from '../../../node'
import { mmin3 } from '../../math/mmin'

export const rgb2cmyk = Fn(([rgb]: [Vec3]): Vec4 => {
	const k = mmin3(float(1).sub(rgb)).toVar()
	const invK = float(1).sub(k).toVar()
	const cmy = float(1).sub(rgb).sub(k).div(invK).mul(step(0, invK)).toVar()
	return vec4(cmy, k).saturate()
}).setLayout({
	name: 'rgb2cmyk',
	type: 'vec4',
	inputs: [{ name: 'rgb', type: 'vec3' }],
})