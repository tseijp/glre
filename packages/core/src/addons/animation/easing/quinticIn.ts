import { Fn, X } from '../../../node'

export const quinticIn = Fn(([t]: [X]): X => {
        return t.pow(5)
}).setLayout({
        name: 'quinticIn',
        type: 'auto',
        inputs: [{ name: 't', type: 'auto' }],
})