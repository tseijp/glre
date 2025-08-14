import { Fn, Float, Vec3, max, abs } from '../../../node'
import { AABBType, AABB } from './aabb'
import { diagonal } from './diagonal'

export const square = Fn(([box]: [AABBType]): AABBType => {
        const diag = diagonal(box).mul(0.5).toVar('diag')
        const center = box.minBounds.add(diag).toVar('center')
        const maxDim = max(abs(diag.x), max(abs(diag.y), abs(diag.z))).toVar('maxDim')
        return AABB({
                minBounds: center.sub(maxDim),
                maxBounds: center.add(maxDim),
        })
}).setLayout({
        name: 'square',
        type: 'auto',
        inputs: [{ name: 'box', type: 'auto' }],
})