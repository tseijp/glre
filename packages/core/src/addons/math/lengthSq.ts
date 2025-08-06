import { Fn } from '../../node'
import type { X } from '../../node/types'

export const lengthSq = Fn(([v]: [X]): X => {
        return v.dot(v)
}).setLayout({
        name: 'lengthSq',
        type: 'auto',
        inputs: [
                {
                        name: 'v',
                        type: 'auto'
                }
        ]
})