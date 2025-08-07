import { Fn, Vec4, Mat4 } from '../../../node'
import { quat2mat3 } from './quat2mat3'
import { toMat4 } from '../toMat4'

export const quat2mat4 = Fn(([q]: [Vec4]): Mat4 => {
        return toMat4(quat2mat3(q))
}).setLayout({
        name: 'quat2mat4',
        type: 'mat4',
        inputs: [
                {
                        name: 'q',
                        type: 'vec4',
                },
        ],
})
