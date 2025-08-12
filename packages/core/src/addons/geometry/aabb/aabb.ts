import { Fn, Float, Vec2, Vec3, Bool, vec2, all } from '../../../node'

// AABB centroid calculation
export const aabbCentroid = Fn(([minVal, maxVal]: [Vec3, Vec3]): Vec3 => {
        return minVal.add(maxVal).mul(0.5)
}).setLayout({
        name: 'aabbCentroid',
        type: 'vec3',
        inputs: [
                { name: 'minVal', type: 'vec3' },
                { name: 'maxVal', type: 'vec3' },
        ],
})

// AABB containment test
export const aabbContain = Fn(([minVal, maxVal, point]: [Vec3, Vec3, Vec3]): Bool => {
        return point.x
                .greaterThan(minVal.x)
                .and(point.x.lessThanEqual(maxVal.x))
                .and(point.y.greaterThan(minVal.y))
                .and(point.y.lessThanEqual(maxVal.y))
                .and(point.z.greaterThan(minVal.z))
                .and(point.z.lessThanEqual(maxVal.z))
}).setLayout({
        name: 'aabbContain',
        type: 'bool',
        inputs: [
                { name: 'minVal', type: 'vec3' },
                { name: 'maxVal', type: 'vec3' },
                { name: 'point', type: 'vec3' },
        ],
})

// AABB diagonal calculation
export const aabbDiagonal = Fn(([minVal, maxVal]: [Vec3, Vec3]): Vec3 => {
        return maxVal.sub(minVal).abs()
}).setLayout({
        name: 'aabbDiagonal',
        type: 'vec3',
        inputs: [
                { name: 'minVal', type: 'vec3' },
                { name: 'maxVal', type: 'vec3' },
        ],
})

// AABB expand with float value
export const aabbExpand = Fn(([minVal, maxVal, value]: [Vec3, Vec3, Float]): Vec2 => {
        return vec2(minVal.sub(value), maxVal.add(value))
}).setLayout({
        name: 'aabbExpand',
        type: 'vec2',
        inputs: [
                { name: 'minVal', type: 'vec3' },
                { name: 'maxVal', type: 'vec3' },
                { name: 'value', type: 'float' },
        ],
})

// AABB ray intersection
export const aabbIntersectRay = Fn(([minVal, maxVal, rayOrigin, rayDir]: [Vec3, Vec3, Vec3, Vec3]): Vec2 => {
        const tMin = minVal.sub(rayOrigin).div(rayDir)
        const tMax = maxVal.sub(rayOrigin).div(rayDir)
        const t1 = tMin.min(tMax)
        const t2 = tMin.max(tMax)
        const tNear = t1.x.max(t1.y).max(t1.z)
        const tFar = t2.x.min(t2.y).min(t2.z)
        return vec2(tNear, tFar)
}).setLayout({
        name: 'aabbIntersectRay',
        type: 'vec2',
        inputs: [
                { name: 'minVal', type: 'vec3' },
                { name: 'maxVal', type: 'vec3' },
                { name: 'rayOrigin', type: 'vec3' },
                { name: 'rayDir', type: 'vec3' },
        ],
})
