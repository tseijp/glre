import { Fn } from '../../node'
import type { Vec2, X } from '../../node/types'

export const lengthSq = Fn(([v]: [X]): X => {
        return (v as Vec2).dot(v as Vec2) as X
}).setLayout({
        name: 'lengthSq',
        type: 'auto',
        inputs: [{ name: 'v', type: 'auto' }],
})
