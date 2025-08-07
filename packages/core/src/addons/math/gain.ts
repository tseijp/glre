import { Fn, X, float, select } from '../../node'

export const gain = Fn(([x, k]: [X, X]): X => {
        const conditionValue = select(x.oneMinus(), x, x.lessThan(0.5))
        const a = float(0.5).mul(float(2).mul(conditionValue).pow(k)).toVar('a')
        return select(a.oneMinus(), a, x.lessThan(0.5))
}).setLayout({
        name: 'gain',
        type: 'auto',
        inputs: [
                { name: 'x', type: 'auto' },
                { name: 'k', type: 'auto' },
        ],
})
