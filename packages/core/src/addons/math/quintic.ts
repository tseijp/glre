import { Fn, X } from '../../node'

export const quintic = Fn(([v]: [X]): X => {
        const v3 = v.mul(v).mul(v).toVar('v3')
        const inner = v.mul(v.mul(6).sub(15)).add(10).toVar('inner')
        return v3.mul(inner)
}).setLayout({
        name: 'quintic',
        type: 'auto',
        inputs: [{ name: 'v', type: 'auto' }],
})
