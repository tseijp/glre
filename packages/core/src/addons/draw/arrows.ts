import { Fn, Vec2, Float, float, vec2, floor, length, clamp, step, min, If } from '../../node'
import { lineSDF2D } from '../sdf/lineSDF'

// Constants
const ARROWS_TILE_SIZE = float(32)
const ARROWS_HEAD_ANGLE = float(0.5)
const ARROWS_HEAD_LENGTH = ARROWS_TILE_SIZE.div(5)
const ARROWS_SHAFT_THICKNESS = float(2)

// Arrow tile center coordinate calculation
export const arrowsTileCenterCoord = Fn(([pos]: [Vec2]): Vec2 => {
	return floor(pos.div(ARROWS_TILE_SIZE)).add(0.5).mul(ARROWS_TILE_SIZE)
}).setLayout({
	name: 'arrowsTileCenterCoord',
	type: 'vec2',
	inputs: [{ name: 'pos', type: 'vec2' }],
})

// Arrows with resolution parameter
export const arrowsWithResolution = Fn(([p, v, resolution]: [Vec2, Vec2, Vec2]): Float => {
	const scaledP = p.mul(resolution).toVar()
	scaledP.subAssign(arrowsTileCenterCoord(scaledP))
	const mag_v = length(v).toVar()
	const mag_p = length(scaledP)
	
	// Check if vector has magnitude and calculate arrow
	const hasVector = mag_v.greaterThan(0).toVar()
	const result = float(0).toVar()
	
	If(hasVector, () => {
		const dir_v = v.div(mag_v)
		mag_v.assign(clamp(mag_v, 5, ARROWS_TILE_SIZE.div(2)))
		const adjustedV = dir_v.mul(mag_v)
		
		// Basic line-style arrow implementation
		const shaft = lineSDF2D(scaledP, adjustedV, adjustedV.negate())
		const head1 = lineSDF2D(scaledP, adjustedV, adjustedV.mul(0.4).add(vec2(adjustedV.y, adjustedV.x.negate()).mul(0.2)))
		const head2 = lineSDF2D(scaledP, adjustedV, adjustedV.mul(0.4).add(vec2(adjustedV.y.negate(), adjustedV.x).mul(0.2)))
		const head = min(head1, head2)
		
		result.assign(step(min(shaft, head), 1))
	})
	
	return result
}).setLayout({
	name: 'arrowsWithResolution',
	type: 'float',
	inputs: [
		{ name: 'p', type: 'vec2' },
		{ name: 'v', type: 'vec2' },
		{ name: 'resolution', type: 'vec2' },
	],
})

// Arrows with default resolution
export const arrows = Fn(([p, v]: [Vec2, Vec2]): Float => {
	return arrowsWithResolution(p, v, vec2(1))
}).setLayout({
	name: 'arrows',
	type: 'float',
	inputs: [
		{ name: 'p', type: 'vec2' },
		{ name: 'v', type: 'vec2' },
	],
})