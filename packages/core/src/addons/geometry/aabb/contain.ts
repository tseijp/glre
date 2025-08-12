import { Fn, Vec3, Bool } from '../../../node'
import { AABBType } from './aabb'

export const contain = Fn(([box, point]: [AABBType, Vec3]): Bool => {
        return point.x
                .greaterThan(box.minBounds.x)
                .and(point.x.lessThanEqual(box.maxBounds.x))
                .and(point.y.greaterThan(box.minBounds.y))
                .and(point.y.lessThanEqual(box.maxBounds.y))
                .and(point.z.greaterThan(box.minBounds.z))
                .and(point.z.lessThanEqual(box.maxBounds.z))
}).setLayout({
        name: 'contain',
        type: 'bool',
        inputs: [
                { name: 'box', type: 'auto' },
                { name: 'point', type: 'vec3' },
        ],
})
