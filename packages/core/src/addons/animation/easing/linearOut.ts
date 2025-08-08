import { Fn, X } from '../../../node'

export const linearOut = Fn(([t]: [X]): X => {
        return t
}).setLayout({
        name: 'linearOut',
        type: 'auto',
        inputs: [
                {
                        name: 't',
                        type: 'auto',
                },
        ],
})
