import { Fn, Vec4, Float } from '../../../node'
import { quatLengthSq } from './quatLengthSq'

export const quatLength = Fn(([q]: [Vec4]): Float => {
        return quatLengthSq(q).sqrt()
}).setLayout({
        name: 'quatLength',
        type: 'float',
        inputs: [
                {
                        name: 'q',
                        type: 'vec4',
                },
        ],
})
