import { Fn, Vec4 } from '../../node'
import { quatDiv } from './quatDiv'
import { quatLength } from './quatLength'

export const quatNorm = Fn(([q]: [Vec4]): Vec4 => {
        return quatDiv(q, quatLength(q))
}).setLayout({
        name: 'quatNorm',
        type: 'vec4',
        inputs: [
                {
                        name: 'q',
                        type: 'vec4'
                }
        ]
})