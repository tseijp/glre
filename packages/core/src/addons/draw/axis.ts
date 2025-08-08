import { Fn, Vec2, Vec3, Vec4, Mat4, Float, vec3, vec4, Loop, int } from '../../node'
import { line } from './line'

export const axis = Fn(([st, M, pos, thickness]: [Vec2, Mat4, Vec3, Float]): Vec4 => {
	let result = vec4(0, 0, 0, 0).toVar()
	
	// Transform center position
	const center = M.mul(vec4(pos, 1)).toVar()
	center.xy.assign(center.xy.div(center.w))
	center.xy.assign(center.xy.mul(0.5).add(0.5))
	
	// Define axis colors (RGB for XYZ)
	const axisColors = [
		vec4(1, 0, 0, 1), // Red for X axis
		vec4(0, 1, 0, 1), // Green for Y axis  
		vec4(0, 0, 1, 1)  // Blue for Z axis
	]
	
	const axisDirections = [
		vec3(1, 0, 0), // X direction
		vec3(0, 1, 0), // Y direction
		vec3(0, 0, 1)  // Z direction
	]
	
	// Draw each axis
	Loop(int(3), ({ i }) => {
		const axisColor = (i.equal(int(0)) as any).select(axisColors[0], 
			(i.equal(int(1)) as any).select(axisColors[1], axisColors[2]))
		
		const axisDir = (i.equal(int(0)) as any).select(axisDirections[0],
			(i.equal(int(1)) as any).select(axisDirections[1], axisDirections[2]))
		
		// Transform axis endpoint
		const axisPoint = (M as any).mul(vec4((pos as any).add(axisDir as any), 1)).toVar()
		axisPoint.xy.assign(axisPoint.xy.div(axisPoint.w))
		axisPoint.xy.assign(axisPoint.xy.mul(0.5).add(0.5))
		
		// Draw line from center to axis endpoint
		const axisLine = line(st, center.xy, axisPoint.xy, thickness)
		result.addAssign((axisColor as any).mul(axisLine as any))
	})
	
	return result
}).setLayout({
	name: 'axis',
	type: 'vec4',
	inputs: [
		{ name: 'st', type: 'vec2' },
		{ name: 'M', type: 'mat4' },
		{ name: 'pos', type: 'vec3' },
		{ name: 'thickness', type: 'float' },
	],
})