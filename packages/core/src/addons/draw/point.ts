import { Fn, Vec2, Vec3, Vec4, Mat4, Float, vec2, vec3, vec4, float, step } from '../../node'
import { digits } from './digits'
import { circleFill } from './circle'

const DIGITS_SIZE = vec2(0.02)
const DIGITS_VALUE_OFFSET = vec2(-6.0, 3.0)

export const pointWithColor = Fn(([st, pos, color, radius]: [Vec2, Vec2, Vec3, Float]): Vec4 => {
        const rta = vec4(0).toVar('rta')
        const st_p = st.sub(pos).toVar('st_p')
        rta.assign(rta.add(vec4(color, 1).mul(circleFill(st_p.add(0.5), radius))))
        st_p.assign(st_p.sub(DIGITS_SIZE.mul(vec2(0, 0.5))))
        const size = DIGITS_SIZE.mul(DIGITS_VALUE_OFFSET.abs()).mul(vec2(2, 0.5))
        rta.a.addAssign(step(0, st_p.x).mul(step(st_p.x, size.x)).mul(step(DIGITS_SIZE.y.mul(-0.5), st_p.y)).mul(step(st_p.y, size.y)).mul(0.5))
        rta.assign(rta.add(digits(st_p, pos)))
        return rta
}).setLayout({
        name: 'pointWithColor',
        type: 'vec4',
        inputs: [
                { name: 'st', type: 'vec2' },
                { name: 'pos', type: 'vec2' },
                { name: 'color', type: 'vec3' },
                { name: 'radius', type: 'float' },
        ],
})

export const pointTransformed = Fn(([st, M, pos, color, radius]: [Vec2, Mat4, Vec3, Vec3, Float]): Vec4 => {
        const rta = vec4(0).toVar('rta')
        const pos4 = M.mul(vec4(pos, 1)).toVar('pos4')
        const p = pos4.xy.div(pos4.w).toVar('p')
        const st_p = st.sub(p.xy.mul(0.5).add(0.5)).toVar('st_p')
        rta.assign(rta.add(vec4(color, 1).mul(circleFill(st_p.add(0.5), radius))))
        st_p.assign(st_p.sub(DIGITS_SIZE.mul(vec2(0, 0.5))))
        const size = DIGITS_SIZE.mul(DIGITS_VALUE_OFFSET.abs()).mul(vec2(3, 0.5))
        rta.a.addAssign(step(0, st_p.x).mul(step(st_p.x, size.x)).mul(step(DIGITS_SIZE.y.mul(-0.5), st_p.y)).mul(step(st_p.y, size.y)).mul(0.5))
        rta.assign(rta.add(digits(st_p, pos)))
        return rta
}).setLayout({
        name: 'pointTransformed',
        type: 'vec4',
        inputs: [
                { name: 'st', type: 'vec2' },
                { name: 'M', type: 'mat4' },
                { name: 'pos', type: 'vec3' },
                { name: 'color', type: 'vec3' },
                { name: 'radius', type: 'float' },
        ],
})

export const point = Fn(([st, pos]: [Vec2, Vec2]): Vec4 => {
        return pointWithColor(st, pos, vec3(1, 0, 0), float(0.02))
}).setLayout({
        name: 'point',
        type: 'vec4',
        inputs: [
                { name: 'st', type: 'vec2' },
                { name: 'pos', type: 'vec2' },
        ],
})

export const pointMat4 = Fn(([st, M, pos]: [Vec2, Mat4, Vec3]): Vec4 => {
        return pointTransformed(st, M, pos, vec3(1, 0, 0), float(0.02))
}).setLayout({
        name: 'pointMat4',
        type: 'vec4',
        inputs: [
                { name: 'st', type: 'vec2' },
                { name: 'M', type: 'mat4' },
                { name: 'pos', type: 'vec3' },
        ],
})
