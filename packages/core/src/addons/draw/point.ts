import { Fn, Vec2, Vec3, Vec4, Float, vec3, vec4, float } from '../../node'
import { circleFill } from './circle'

export const point2D = Fn(([st, pos, color, radius]: [Vec2, Vec2, Vec3, Float]): Vec4 => {
        const st_p = st.sub(pos)
        const circle = circleFill(st_p.add(0.5), radius)
        return vec4(color, 1).mul(circle)
}).setLayout({
        name: 'point2D',
        type: 'vec4',
        inputs: [
                { name: 'st', type: 'vec2' },
                { name: 'pos', type: 'vec2' },
                { name: 'color', type: 'vec3' },
                { name: 'radius', type: 'float' },
        ],
})

export const pointSimple = Fn(([st, pos]: [Vec2, Vec2]): Vec4 => {
        return point2D(st, pos, vec3(1, 0, 0), float(0.02))
}).setLayout({
        name: 'pointSimple',
        type: 'vec4',
        inputs: [
                { name: 'st', type: 'vec2' },
                { name: 'pos', type: 'vec2' },
        ],
})

export const point = pointSimple
