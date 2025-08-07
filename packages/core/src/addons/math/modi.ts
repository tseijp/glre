import { Fn, Int } from '../../node'

export const modi = Fn(([x, y]: [Int, Int]): Int => {
        const xf = x.toFloat()
        const yf = y.toFloat()
        const quotient = xf.div(yf).floor()
        return x.sub(quotient.mul(yf).toInt())
}).setLayout({
        name: 'modi',
        type: 'int',
        inputs: [
                { name: 'x', type: 'int' },
                { name: 'y', type: 'int' },
        ],
})
