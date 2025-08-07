import { Fn, Vec4 } from '../../../node'
import { quatDiv } from './quatDiv'
import { quatConj } from './quatConj'
import { quatLengthSq } from './quatLengthSq'

export const quatInverse = Fn(([q]: [Vec4]): Vec4 => {
        return quatDiv(quatConj(q), quatLengthSq(q))
}).setLayout({
        name: 'quatInverse',
        type: 'vec4',
        inputs: [
                {
                        name: 'q',
                        type: 'vec4',
                },
        ],
})
