import { Fn, Vec3, Vec2, vec2 } from '../../../node'
import { AABBType } from './aabb'

export const intersect = Fn(([box, rayOrigin, rayDir]: [AABBType, Vec3, Vec3]): Vec2 => {
        const tMin = box.minBounds.sub(rayOrigin).div(rayDir)
        const tMax = box.maxBounds.sub(rayOrigin).div(rayDir)
        const t1 = tMin.min(tMax)
        const t2 = tMin.max(tMax)
        const tNear = t1.x.max(t1.y).max(t1.z)
        const tFar = t2.x.min(t2.y).min(t2.z)
        return vec2(tNear, tFar)
}).setLayout({
        name: 'intersect',
        type: 'vec2',
        inputs: [
                { name: 'box', type: 'auto' },
                { name: 'rayOrigin', type: 'vec3' },
                { name: 'rayDir', type: 'vec3' },
        ],
})
