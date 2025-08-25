import { Fn, Vec2, Vec3, Float, vec2, vec3 } from '../../node'

export const scale2d = Fn(([st, s]: [Vec2, Float]): Vec2 => {
        return st.sub(vec2(0.5)).mul(s).add(vec2(0.5))
}).setLayout({
        name: 'scale2d',
        type: 'vec2',
        inputs: [
                { name: 'st', type: 'vec2' },
                { name: 's', type: 'float' },
        ],
})

export const scale2dWithCenter = Fn(([st, s, center]: [Vec2, Float, Vec2]): Vec2 => {
        return st.sub(center).mul(s).add(center)
}).setLayout({
        name: 'scale2dWithCenter',
        type: 'vec2',
        inputs: [
                { name: 'st', type: 'vec2' },
                { name: 's', type: 'float' },
                { name: 'center', type: 'vec2' },
        ],
})

export const scale2dVec = Fn(([st, s]: [Vec2, Vec2]): Vec2 => {
        return st.sub(vec2(0.5)).mul(s).add(vec2(0.5))
}).setLayout({
        name: 'scale2dVec',
        type: 'vec2',
        inputs: [
                { name: 'st', type: 'vec2' },
                { name: 's', type: 'vec2' },
        ],
})

export const scale3d = Fn(([st, s]: [Vec3, Float]): Vec3 => {
        return st.sub(vec3(0.5)).mul(s).add(vec3(0.5))
}).setLayout({
        name: 'scale3d',
        type: 'vec3',
        inputs: [
                { name: 'st', type: 'vec3' },
                { name: 's', type: 'float' },
        ],
})

export const scale = scale2dVec
