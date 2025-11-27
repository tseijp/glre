import { Fn, int } from '../../node'

export const taylorInvSqrt = Fn(([r]) => {
        return r.mul(-0.85373472095314).add(1.79284291400159)
}).setLayout({
        name: 'taylorInvSqrt',
        type: 'auto',
        inputs: [{ name: 'r', type: 'auto' }],
})
