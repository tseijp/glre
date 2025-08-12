import { Fn, Float, Vec3, length, cross, dot, vec3, float } from '../../../node'
import { area } from './area'

export const barycentric = Fn(([a, b, c]: [Vec3, Vec3, Vec3]): Vec3 => {
	const daa = dot(a, a).toVar('daa')
	const dab = dot(a, b).toVar('dab')
	const dbb = dot(b, b).toVar('dbb')
	const dca = dot(c, a).toVar('dca')
	const dcb = dot(c, b).toVar('dcb')
	const denom = daa.mul(dbb).sub(dab.mul(dab)).toVar('denom')
	const y = dbb.mul(dca).sub(dab.mul(dcb)).div(denom).toVar('y')
	const z = daa.mul(dcb).sub(dab.mul(dca)).div(denom).toVar('z')
	return vec3(float(1).sub(y).sub(z), y, z)
}).setLayout({
	name: 'barycentric',
	type: 'vec3',
	inputs: [
		{ name: 'a', type: 'vec3' },
		{ name: 'b', type: 'vec3' },
		{ name: 'c', type: 'vec3' },
	],
})

export const barycentricFromPosition = Fn(([a, b, c, pos]: [Vec3, Vec3, Vec3, Vec3]): Vec3 => {
	const f0 = a.sub(pos).toVar('f0')
	const f1 = b.sub(pos).toVar('f1')
	const f2 = c.sub(pos).toVar('f2')
	const areaValue = area(a, b, c).toVar('area')
	return vec3(
		length(cross(f1, f2)),
		length(cross(f2, f0)),
		length(cross(f0, f1))
	).div(areaValue)
}).setLayout({
	name: 'barycentricFromPosition',
	type: 'vec3',
	inputs: [
		{ name: 'a', type: 'vec3' },
		{ name: 'b', type: 'vec3' },
		{ name: 'c', type: 'vec3' },
		{ name: 'pos', type: 'vec3' },
	],
})