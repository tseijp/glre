import { Fn, X } from '../../../node'

export const linearInOut = Fn(([t]: [X]): X => {
        return t
}).setLayout({
        name: 'linearInOut',
        type: 'auto',
        inputs: [{ name: 't', type: 'auto' }],
})
