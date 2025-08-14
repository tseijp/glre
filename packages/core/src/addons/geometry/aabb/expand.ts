import { Fn, Vec3, Float } from '../../../node'
import { AABBType, AABB } from './aabb'

export const expand = Fn(([box, value]: [AABBType, Float]): AABBType => {
        return AABB({
                minBounds: box.minBounds.sub(value),
                maxBounds: box.maxBounds.add(value),
        })
}).setLayout({
        name: 'expand',
        type: 'auto',
        inputs: [
                { name: 'box', type: 'auto' },
                { name: 'value', type: 'float' },
        ],
})
