import { Fn, Float, Vec3, float, vec3 } from '../../../node'

export const hue2rgb = Fn(([hue]: [Float]): Vec3 => {
	const R = hue.mul(6).sub(3).abs().sub(1).toVar()
	const G = float(2).sub(hue.mul(6).sub(2).abs()).toVar()
	const B = float(2).sub(hue.mul(6).sub(4).abs()).toVar()
	return vec3(R, G, B).saturate()
}).setLayout({
	name: 'hue2rgb',
	type: 'vec3',
	inputs: [{ name: 'hue', type: 'float' }],
})