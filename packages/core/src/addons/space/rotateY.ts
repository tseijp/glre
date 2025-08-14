import { Fn, Vec3, Vec4, Float, vec4 } from '../../node'
import { rotate4dY } from '../math/rotate4dY'

// vec4 rotateY(in vec4 v, in float r, in vec4 c)
export const rotateYVec4Center = Fn(([v, r, c]: [Vec4, Float, Vec4]): Vec4 => {
        return rotate4dY(r).mul(v.sub(c)).add(c)
}).setLayout({
        name: 'rotateYVec4Center',
        type: 'vec4',
        inputs: [
                { name: 'v', type: 'vec4' },
                { name: 'r', type: 'float' },
                { name: 'c', type: 'vec4' },
        ],
})

// vec4 rotateY(in vec4 v, in float r)
export const rotateYVec4 = Fn(([v, r]: [Vec4, Float]): Vec4 => {
        return rotate4dY(r).mul(v)
}).setLayout({
        name: 'rotateYVec4',
        type: 'vec4',
        inputs: [
                { name: 'v', type: 'vec4' },
                { name: 'r', type: 'float' },
        ],
})

// vec3 rotateY(in vec3 v, in float r, in vec3 c)
export const rotateYVec3Center = Fn(([v, r, c]: [Vec3, Float, Vec3]): Vec3 => {
        return rotate4dY(r)
                .mul(vec4(v.sub(c), 1))
                .xyz.add(c)
}).setLayout({
        name: 'rotateYVec3Center',
        type: 'vec3',
        inputs: [
                { name: 'v', type: 'vec3' },
                { name: 'r', type: 'float' },
                { name: 'c', type: 'vec3' },
        ],
})

// vec3 rotateY(in vec3 v, in float r)
export const rotateYVec3 = Fn(([v, r]: [Vec3, Float]): Vec3 => {
        return rotate4dY(r).mul(vec4(v, 1)).xyz
}).setLayout({
        name: 'rotateYVec3',
        type: 'vec3',
        inputs: [
                { name: 'v', type: 'vec3' },
                { name: 'r', type: 'float' },
        ],
})
