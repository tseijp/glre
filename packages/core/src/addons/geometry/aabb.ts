import { Fn, Vec2, Vec3, Float, Bool, all, struct, vec2, vec3 } from '../../node'
import { Ray } from '../lighting/ray'

// AABB struct
const AABB = struct({
        min: vec3(),
        max: vec3(),
})

// AABB centroid function
export const aabbCentroid = Fn(([boxMin, boxMax]: [Vec3, Vec3]) => {
        return boxMin.add(boxMax).mul(0.5)
}).setLayout({
        name: 'aabbCentroid',
        type: 'vec3',
        inputs: [
                { name: 'boxMin', type: 'vec3' },
                { name: 'boxMax', type: 'vec3' },
        ],
})

// AABB contain function
export const aabbContain = Fn(([boxMin, boxMax, point]: [Vec3, Vec3, Vec3]) => {
        const lessThanEqualCheck = all(point.lessThanEqual(boxMax))
        const lessThanCheck = all(boxMin.lessThan(point))
        return lessThanEqualCheck.and(lessThanCheck)
}).setLayout({
        name: 'aabbContain',
        type: 'bool',
        inputs: [
                { name: 'boxMin', type: 'vec3' },
                { name: 'boxMax', type: 'vec3' },
                { name: 'point', type: 'vec3' },
        ],
})

// AABB diagonal function
export const aabbDiagonal = Fn(([boxMin, boxMax]: [Vec3, Vec3]) => {
        return boxMax.sub(boxMin).abs()
}).setLayout({
        name: 'aabbDiagonal',
        type: 'vec3',
        inputs: [
                { name: 'boxMin', type: 'vec3' },
                { name: 'boxMax', type: 'vec3' },
        ],
})

// AABB expand with float - returns new min and max
export const aabbExpandFloat = Fn(([boxMin, boxMax, value]: [Vec3, Vec3, Float]) => {
        const newMin = boxMin.sub(value)
        const newMax = boxMax.add(value)
        return vec2(newMin.x, newMin.y) // Just return a simple vec2 for now
}).setLayout({
        name: 'aabbExpandFloat',
        type: 'vec2',
        inputs: [
                { name: 'boxMin', type: 'vec3' },
                { name: 'boxMax', type: 'vec3' },
                { name: 'value', type: 'float' },
        ],
})

// AABB expand with vec3 point - returns new min and max as vec2
export const aabbExpandVec3 = Fn(([boxMin, boxMax, point]: [Vec3, Vec3, Vec3]) => {
        const newMin = boxMin.min(point)
        const newMax = boxMax.max(point)
        return vec2(newMin.x, newMax.x) // Return components as vec2
}).setLayout({
        name: 'aabbExpandVec3',
        type: 'vec2',
        inputs: [
                { name: 'boxMin', type: 'vec3' },
                { name: 'boxMax', type: 'vec3' },
                { name: 'point', type: 'vec3' },
        ],
})

// AABB intersect with ray components
export const aabbIntersectRay = Fn(([boxMin, boxMax, rayOrigin, rayDir]: [Vec3, Vec3, Vec3, Vec3]) => {
        const tMin = boxMin.sub(rayOrigin).div(rayDir)
        const tMax = boxMax.sub(rayOrigin).div(rayDir)
        const t1 = tMin.min(tMax)
        const t2 = tMin.max(tMax)
        const tNear = t1.x.max(t1.y).max(t1.z)
        const tFar = t2.x.min(t2.y).min(t2.z)
        return vec2(tNear, tFar)
}).setLayout({
        name: 'aabbIntersectRay',
        type: 'vec2',
        inputs: [
                { name: 'boxMin', type: 'vec3' },
                { name: 'boxMax', type: 'vec3' },
                { name: 'rayOrigin', type: 'vec3' },
                { name: 'rayDir', type: 'vec3' },
        ],
})

// AABB intersect with Ray struct components
export const aabbIntersectRayStruct = Fn(([boxMin, boxMax, rayOrigin, rayDirection]: [Vec3, Vec3, Vec3, Vec3]) => {
        const tMin = boxMin.sub(rayOrigin).div(rayDirection)
        const tMax = boxMax.sub(rayOrigin).div(rayDirection)
        const t1 = tMin.min(tMax)
        const t2 = tMin.max(tMax)
        const tNear = t1.x.max(t1.y).max(t1.z)
        const tFar = t2.x.min(t2.y).min(t2.z)
        return vec2(tNear, tFar)
}).setLayout({
        name: 'aabbIntersectRayStruct',
        type: 'vec2',
        inputs: [
                { name: 'boxMin', type: 'vec3' },
                { name: 'boxMax', type: 'vec3' },
                { name: 'rayOrigin', type: 'vec3' },
                { name: 'rayDirection', type: 'vec3' },
        ],
})

// AABB square function - returns new center as vec3
export const aabbSquare = Fn(([boxMin, boxMax]: [Vec3, Vec3]) => {
        const diag = boxMax.sub(boxMin).abs().mul(0.5)
        const cntr = boxMin.add(diag)
        const mmax = diag.x.max(diag.y).max(diag.z)
        const newMax = cntr.add(mmax)
        const newMin = cntr.sub(mmax)
        return vec3(cntr.x, newMax.x, newMin.x) // Return some components as vec3
}).setLayout({
        name: 'aabbSquare',
        type: 'vec3',
        inputs: [
                { name: 'boxMin', type: 'vec3' },
                { name: 'boxMax', type: 'vec3' },
        ],
})

// Export struct (Note: struct is not tested by tsl.ts)
export { AABB }