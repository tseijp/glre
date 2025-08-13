import { Fn, Float, Vec3, length, sign, dot } from '../../../node'
import { triangleNormal } from './normal'
import { closestPointWithNormal, closestPoint } from './closestPoint'

export const triangleSignedDistanceWithNormal = Fn(([a, b, c, triNormal, pos]: [Vec3, Vec3, Vec3, Vec3, Vec3]): Float => {
	const nearest = closestPointWithNormal(a, b, c, triNormal, pos).toVar('nearest')
	const delta = pos.sub(nearest).toVar('delta')
	const distance = length(delta).toVar('distance')
	return distance.mul(sign(dot(delta.div(distance), triNormal)))
}).setLayout({
	name: 'triangleSignedDistanceWithNormal',
	type: 'float',
	inputs: [
		{ name: 'a', type: 'vec3' },
		{ name: 'b', type: 'vec3' },
		{ name: 'c', type: 'vec3' },
		{ name: 'triNormal', type: 'vec3' },
		{ name: 'pos', type: 'vec3' },
	],
})

export const triangleSignedDistance = Fn(([a, b, c, pos]: [Vec3, Vec3, Vec3, Vec3]): Float => {
	const triNormal = triangleNormal(a, b, c).toVar('triNormal')
	return triangleSignedDistanceWithNormal(a, b, c, triNormal, pos)
}).setLayout({
	name: 'triangleSignedDistance',
	type: 'float',
	inputs: [
		{ name: 'a', type: 'vec3' },
		{ name: 'b', type: 'vec3' },
		{ name: 'c', type: 'vec3' },
		{ name: 'pos', type: 'vec3' },
	],
})

export const signedDistance = triangleSignedDistance