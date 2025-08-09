import { X, Fn } from '../../node'

export const cubic = Fn((args: [X] | [X, X, X]): X => {
        const [v, slope0, slope1] = args
        if (!slope0 || !slope1) return v.mul(v).mul(v.mul(-2).add(3))
        const a = slope0.add(slope1).sub(2).toVar('a')
        const b = slope0.mul(-2).sub(slope1).add(3).toVar('b')
        const c = slope0.toVar('c')
        const v2 = v.mul(v).toVar('v2')
        const v3 = v.mul(v2).toVar('v3')
        return a.mul(v3).add(b.mul(v2)).add(c.mul(v))
}).setLayout({
        name: 'cubic',
        type: 'auto',
        inputs: [
                { name: 'v', type: 'auto' },
                { name: 'slope0', type: 'float' },
                { name: 'slope1', type: 'float' },
        ],
})
