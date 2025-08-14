import { Fn, Vec3 } from '../../../node'
import { AABBType } from './aabb'

export const aabbCentroid = Fn(([box]: [AABBType]): Vec3 => {
        return box.minBounds.add(box.maxBounds).mul(0.5)
}).setLayout({
        name: 'aabbCentroid',
        type: 'vec3',
        inputs: [{ name: 'box', type: 'auto' }],
})
