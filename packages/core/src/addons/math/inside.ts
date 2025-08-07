import { Fn, all } from '../../node'
import type { Bool, Float, Vec2, Vec3, Vec4, X } from '../../node/types'

export const inside = Fn(([x, min, max]: [X, X, X]): Bool => {
        return all(x.greaterThanEqual(min).and(x.lessThanEqual(max)))
}).setLayout({
        name: 'inside',
        type: 'bool',
        inputs: [
                { name: 'x', type: 'auto' },
                { name: 'min', type: 'auto' },
                { name: 'max', type: 'auto' },
        ],
})

export const insideFloat = Fn(([x, min, max]: [Float, Float, Float]): Bool => {
        return x.greaterThanEqual(min).and(x.lessThanEqual(max))
}).setLayout({
        name: 'insideFloat',
        type: 'bool',
        inputs: [
                { name: 'x', type: 'float' },
                { name: 'min', type: 'float' },
                { name: 'max', type: 'float' },
        ],
})

export const insideVec2 = Fn(([v, min, max]: [Vec2, Vec2, Vec2]): Bool => {
        return v.x
                .greaterThanEqual(min.x)
                .and(v.x.lessThanEqual(max.x))
                .and(v.y.greaterThanEqual(min.y).and(v.y.lessThanEqual(max.y)))
}).setLayout({
        name: 'insideVec2',
        type: 'bool',
        inputs: [
                { name: 'v', type: 'vec2' },
                { name: 'min', type: 'vec2' },
                { name: 'max', type: 'vec2' },
        ],
})

export const insideVec3 = Fn(([v, min, max]: [Vec3, Vec3, Vec3]): Bool => {
        return v.x
                .greaterThanEqual(min.x)
                .and(v.x.lessThanEqual(max.x))
                .and(v.y.greaterThanEqual(min.y).and(v.y.lessThanEqual(max.y)))
                .and(v.z.greaterThanEqual(min.z).and(v.z.lessThanEqual(max.z)))
}).setLayout({
        name: 'insideVec3',
        type: 'bool',
        inputs: [
                { name: 'v', type: 'vec3' },
                { name: 'min', type: 'vec3' },
                { name: 'max', type: 'vec3' },
        ],
})

export const insideAABB = Fn(([v, aabb]: [Vec2, Vec4]): Bool => {
        return insideVec2(v, aabb.xy, aabb.zw)
}).setLayout({
        name: 'insideAABB',
        type: 'bool',
        inputs: [
                { name: 'v', type: 'vec2' },
                { name: 'aabb', type: 'vec4' },
        ],
})
