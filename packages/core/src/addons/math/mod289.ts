import { Fn, X, floor } from '../../node'

// Modulo operation with base 289 (17^2) - essential constant for procedural noise algorithms
export const mod289 = Fn(([x]: [X]): X => {
        return x.sub(
                x
                        .mul(1.0 / 289.0)
                        .floor()
                        .mul(289.0)
        )
}).setLayout({
        name: 'mod289',
        type: 'auto',
        inputs: [{ name: 'x', type: 'auto' }],
})
