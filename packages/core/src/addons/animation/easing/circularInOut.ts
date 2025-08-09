import { Fn, X } from '../../../node'

export const circularInOut = Fn(([t]: [X]): X => {
        const early = t.mul(t).mul(4).oneMinus().sqrt().oneMinus().div(2)
        const late = t.mul(2).sub(1).mul(t.mul(-2).add(3)).sqrt().add(1).div(2)
        return (early as any).select(late, t.lessThan(0.5))
}).setLayout({
        name: 'circularInOut',
        type: 'auto',
        inputs: [{ name: 't', type: 'auto' }],
})
