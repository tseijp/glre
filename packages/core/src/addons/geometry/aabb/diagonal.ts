import { Fn, Vec3 } from '../../../node'
import { AABBType } from './aabb'

export const diagonal = Fn(([box]: [AABBType]): Vec3 => {
        return box.maxBounds.sub(box.minBounds).abs()
}).setLayout({
        name: 'diagonal',
        type: 'vec3',
        inputs: [{ name: 'box', type: 'auto' }],
})
