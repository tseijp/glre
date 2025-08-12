import { Fn, Vec3, Float, dot, length, cross, normalize, max, min, vec3, float, If, Return } from '../../../node'
import { barycentric } from './barycentric'

export const closestPointWithNormal = Fn(([a, b, c, triNormal, pos]: [Vec3, Vec3, Vec3, Vec3, Vec3]): Vec3 => {
	const ab = b.sub(a).toVar('ab')
	const ac = c.sub(a).toVar('ac')
	const normal = triNormal.toVar('normal')
	const p = pos.sub(dot(triNormal, pos.sub(a)).mul(triNormal)).toVar('p')
	const ap = p.sub(a).toVar('ap')
	const bcoords = barycentric(ab, ac, ap).toVar('bcoords')

	If(bcoords.x.lessThan(0), () => {
		const bc = c.sub(b).toVar('bc')
		const n = length(bc).toVar('n')
		const t = max(float(0), min(dot(bc, p.sub(b)).div(n), n)).toVar('t')
		Return(b.add(t.div(n).mul(bc)))
	})

	If(bcoords.y.lessThan(0), () => {
		const ca = a.sub(c).toVar('ca')
		const n = length(ca).toVar('n')
		const t = max(float(0), min(dot(ca, p.sub(c)).div(n), n)).toVar('t')
		Return(c.add(t.div(n).mul(ca)))
	})

	If(bcoords.z.lessThan(0), () => {
		const n = length(ab).toVar('n')
		const t = max(float(0), min(dot(ab, p.sub(a)).div(n), n)).toVar('t')
		Return(a.add(t.div(n).mul(ab)))
	})

	return a.mul(bcoords.x).add(b.mul(bcoords.y)).add(c.mul(bcoords.z))
}).setLayout({
	name: 'closestPointWithNormal',
	type: 'vec3',
	inputs: [
		{ name: 'a', type: 'vec3' },
		{ name: 'b', type: 'vec3' },
		{ name: 'c', type: 'vec3' },
		{ name: 'triNormal', type: 'vec3' },
		{ name: 'pos', type: 'vec3' },
	],
})

export const closestPoint = Fn(([a, b, c, pos]: [Vec3, Vec3, Vec3, Vec3]): Vec3 => {
	const ab = b.sub(a).toVar('ab')
	const ac = c.sub(a).toVar('ac')
	const normal = normalize(cross(ac, ab)).toVar('normal')
	const p = pos.sub(dot(normal, pos.sub(a)).mul(normal)).toVar('p')
	const ap = p.sub(a).toVar('ap')
	const bcoords = barycentric(ab, ac, ap).toVar('bcoords')

	If(bcoords.x.lessThan(0), () => {
		const bc = c.sub(b).toVar('bc')
		const n = length(bc).toVar('n')
		const t = max(float(0), min(dot(bc, p.sub(b)).div(n), n)).toVar('t')
		Return(b.add(t.div(n).mul(bc)))
	})

	If(bcoords.y.lessThan(0), () => {
		const ca = a.sub(c).toVar('ca')
		const n = length(ca).toVar('n')
		const t = max(float(0), min(dot(ca, p.sub(c)).div(n), n)).toVar('t')
		Return(c.add(t.div(n).mul(ca)))
	})

	If(bcoords.z.lessThan(0), () => {
		const n = length(ab).toVar('n')
		const t = max(float(0), min(dot(ab, p.sub(a)).div(n), n)).toVar('t')
		Return(a.add(t.div(n).mul(ab)))
	})

	return a.mul(bcoords.x).add(b.mul(bcoords.y)).add(c.mul(bcoords.z))
}).setLayout({
	name: 'closestPoint',
	type: 'vec3',
	inputs: [
		{ name: 'a', type: 'vec3' },
		{ name: 'b', type: 'vec3' },
		{ name: 'c', type: 'vec3' },
		{ name: 'pos', type: 'vec3' },
	],
})