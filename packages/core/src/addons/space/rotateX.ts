import { Fn, Vec3, Vec4, Float, vec4 } from '../../node'
import { rotate4dX } from '../math/rotate4dX'

// vec4 rotateX(in vec4 v, in float r, in vec4 c)
export const rotateXVec4Center = Fn(([v, r, c]: [Vec4, Float, Vec4]): Vec4 => {
        return rotate4dX(r).mul(v.sub(c)).add(c)
}).setLayout({
        name: 'rotateXVec4Center',
        type: 'vec4',
        inputs: [
                { name: 'v', type: 'vec4' },
                { name: 'r', type: 'float' },
                { name: 'c', type: 'vec4' },
        ],
})

// vec4 rotateX(in vec4 v, in float r)
export const rotateXVec4 = Fn(([v, r]: [Vec4, Float]): Vec4 => {
        return rotate4dX(r).mul(v)
}).setLayout({
        name: 'rotateXVec4',
        type: 'vec4',
        inputs: [
                { name: 'v', type: 'vec4' },
                { name: 'r', type: 'float' },
        ],
})

// vec3 rotateX(in vec3 v, in float r, in vec3 c)
export const rotateXVec3Center = Fn(([v, r, c]: [Vec3, Float, Vec3]): Vec3 => {
        return rotate4dX(r)
                .mul(vec4(v.sub(c), 1))
                .xyz.add(c)
}).setLayout({
        name: 'rotateXVec3Center',
        type: 'vec3',
        inputs: [
                { name: 'v', type: 'vec3' },
                { name: 'r', type: 'float' },
                { name: 'c', type: 'vec3' },
        ],
})

// vec3 rotateX(in vec3 v, in float r)
export const rotateXVec3 = Fn(([v, r]: [Vec3, Float]): Vec3 => {
        return rotate4dX(r).mul(vec4(v, 1)).xyz
}).setLayout({
        name: 'rotateXVec3',
        type: 'vec3',
        inputs: [
                { name: 'v', type: 'vec3' },
                { name: 'r', type: 'float' },
        ],
})
