import { Fn, X } from '../../../node'

export const linearIn = Fn(([t]: [X]): X => {
        return t
}).setLayout({
        name: 'linearIn',
        type: 'auto',
        inputs: [{ name: 't', type: 'auto' }],
})
