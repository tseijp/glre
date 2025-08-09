import { Fn, X } from '../../../node'

export const quinticOut = Fn(([t]: [X]): X => {
        return t.sub(1).pow(5).negate().add(1)
}).setLayout({
        name: 'quinticOut',
        type: 'auto',
        inputs: [{ name: 't', type: 'auto' }],
})
