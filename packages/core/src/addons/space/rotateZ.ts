import { Fn, Vec3, Vec4, Float, vec4 } from '../../node'
import { rotate4dZ } from '../math/rotate4dZ'

// vec4 rotateZ(in vec4 v, in float r, in vec4 c)
export const rotateZVec4Center = Fn(([v, r, c]: [Vec4, Float, Vec4]): Vec4 => {
        return rotate4dZ(r).mul(v.sub(c)).add(c)
}).setLayout({
        name: 'rotateZVec4Center',
        type: 'vec4',
        inputs: [
                { name: 'v', type: 'vec4' },
                { name: 'r', type: 'float' },
                { name: 'c', type: 'vec4' },
        ],
})

// vec4 rotateZ(in vec4 v, in float r)
export const rotateZVec4 = Fn(([v, r]: [Vec4, Float]): Vec4 => {
        return rotate4dZ(r).mul(v)
}).setLayout({
        name: 'rotateZVec4',
        type: 'vec4',
        inputs: [
                { name: 'v', type: 'vec4' },
                { name: 'r', type: 'float' },
        ],
})

// vec3 rotateZ(in vec3 v, in float r, in vec3 c)
export const rotateZVec3Center = Fn(([v, r, c]: [Vec3, Float, Vec3]): Vec3 => {
        return rotate4dZ(r)
                .mul(vec4(v.sub(c), 0))
                .xyz.add(c)
}).setLayout({
        name: 'rotateZVec3Center',
        type: 'vec3',
        inputs: [
                { name: 'v', type: 'vec3' },
                { name: 'r', type: 'float' },
                { name: 'c', type: 'vec3' },
        ],
})

// vec3 rotateZ(in vec3 v, in float r)
export const rotateZVec3 = Fn(([v, r]: [Vec3, Float]): Vec3 => {
        return rotate4dZ(r).mul(vec4(v, 0)).xyz
}).setLayout({
        name: 'rotateZVec3',
        type: 'vec3',
        inputs: [
                { name: 'v', type: 'vec3' },
                { name: 'r', type: 'float' },
        ],
})
