import { Fn, Vec2, Vec3, Vec4, vec2, vec3, vec4, float } from '../../node'
import { snoise2, snoise3Vec3, snoise3Vec4 } from './snoise'

export const curlVec2 = Fn(([p]: [Vec2]): Vec2 => {
        const e = float(0.1).toVar('e')
        const dx = vec2(e, 0).toVar('dx')
        const dy = vec2(0, e).toVar('dy')
        const p_x0 = snoise2(p.sub(dx)).toVar('p_x0')
        const p_x1 = snoise2(p.add(dx)).toVar('p_x1')
        const p_y0 = snoise2(p.sub(dy)).toVar('p_y0')
        const p_y1 = snoise2(p.add(dy)).toVar('p_y1')
        const x = p_x1.y.add(p_x0.y).toVar('x')
        const y = p_y1.x.sub(p_y0.x).toVar('y')
        const divisor = float(1).div(e.mul(2)).toVar('divisor')
        return vec2(x, y).mul(divisor).normalize()
}).setLayout({
        name: 'curlVec2',
        type: 'vec2',
        inputs: [{ name: 'p', type: 'vec2' }],
})

export const curlVec3 = Fn(([p]: [Vec3]): Vec3 => {
        const e = float(0.1).toVar('e')
        const dx = vec3(e, 0, 0).toVar('dx')
        const dy = vec3(0, e, 0).toVar('dy')
        const dz = vec3(0, 0, e).toVar('dz')
        const p_x0 = snoise3Vec3(p.sub(dx)).toVar('p_x0')
        const p_x1 = snoise3Vec3(p.add(dx)).toVar('p_x1')
        const p_y0 = snoise3Vec3(p.sub(dy)).toVar('p_y0')
        const p_y1 = snoise3Vec3(p.add(dy)).toVar('p_y1')
        const p_z0 = snoise3Vec3(p.sub(dz)).toVar('p_z0')
        const p_z1 = snoise3Vec3(p.add(dz)).toVar('p_z1')
        const x = p_y1.z.sub(p_y0.z).sub(p_z1.y).add(p_z0.y).toVar('x')
        const y = p_z1.x.sub(p_z0.x).sub(p_x1.z).add(p_x0.z).toVar('y')
        const z = p_x1.y.sub(p_x0.y).sub(p_y1.x).add(p_y0.x).toVar('z')
        const divisor = float(1).div(e.mul(2)).toVar('divisor')
        return vec3(x, y, z).mul(divisor).normalize()
}).setLayout({
        name: 'curlVec3',
        type: 'vec3',
        inputs: [{ name: 'p', type: 'vec3' }],
})

export const curlVec4 = Fn(([p]: [Vec4]): Vec3 => {
        const e = float(0.1).toVar('e')
        const dx = vec4(e, 0, 0, 1).toVar('dx')
        const dy = vec4(0, e, 0, 1).toVar('dy')
        const dz = vec4(0, 0, e, 1).toVar('dz')
        const p_x0 = snoise3Vec4(p.sub(dx)).toVar('p_x0')
        const p_x1 = snoise3Vec4(p.add(dx)).toVar('p_x1')
        const p_y0 = snoise3Vec4(p.sub(dy)).toVar('p_y0')
        const p_y1 = snoise3Vec4(p.add(dy)).toVar('p_y1')
        const p_z0 = snoise3Vec4(p.sub(dz)).toVar('p_z0')
        const p_z1 = snoise3Vec4(p.add(dz)).toVar('p_z1')
        const x = p_y1.z.sub(p_y0.z).sub(p_z1.y).add(p_z0.y).toVar('x')
        const y = p_z1.x.sub(p_z0.x).sub(p_x1.z).add(p_x0.z).toVar('y')
        const z = p_x1.y.sub(p_x0.y).sub(p_y1.x).add(p_y0.x).toVar('z')
        const divisor = float(1).div(e.mul(2)).toVar('divisor')
        return vec3(x, y, z).mul(divisor).normalize()
}).setLayout({
        name: 'curlVec4',
        type: 'vec3',
        inputs: [{ name: 'p', type: 'vec4' }],
})
