import { Fn, Vec2, Vec3, Vec4, Mat4, Float, vec3, vec4 } from '../../node'
import { line } from './line'

export const axis = Fn(([st, M, pos, thickness]: [Vec2, Mat4, Vec3, Float]): Vec4 => {
        const rta = vec4(0).toVar()

        // Transform center position
        const center = M.mul(vec4(pos, 1)).toVar()
        center.xy.divAssign(center.w)
        center.xy.assign(center.xy.mul(0.5).add(0.5))

        // X axis (red)
        const axisX = vec4(1, 0, 0, 1)
        const aX = M.mul(vec4(pos.add(vec3(1, 0, 0)), 1)).toVar()
        aX.xy.divAssign(aX.w)
        aX.xy.assign(aX.xy.mul(0.5).add(0.5))
        rta.addAssign(axisX.mul(line(st, center.xy, aX.xy, thickness)))

        // Y axis (green)
        const axisY = vec4(0, 1, 0, 1)
        const aY = M.mul(vec4(pos.add(vec3(0, 1, 0)), 1)).toVar()
        aY.xy.divAssign(aY.w)
        aY.xy.assign(aY.xy.mul(0.5).add(0.5))
        rta.addAssign(axisY.mul(line(st, center.xy, aY.xy, thickness)))

        // Z axis (blue)
        const axisZ = vec4(0, 0, 1, 1)
        const aZ = M.mul(vec4(pos.add(vec3(0, 0, 1)), 1)).toVar()
        aZ.xy.divAssign(aZ.w)
        aZ.xy.assign(aZ.xy.mul(0.5).add(0.5))
        rta.addAssign(axisZ.mul(line(st, center.xy, aZ.xy, thickness)))

        return rta
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
