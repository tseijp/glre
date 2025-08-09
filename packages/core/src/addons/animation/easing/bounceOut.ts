import { Fn, Float, float } from '../../../node'

export const bounceOut = Fn(([t]: [Float]): Float => {
        const a = float(4 / 11)
        const b = float(8 / 11)
        const c = float(9 / 10)
        const ca = float(4356.0 / 361.0)
        const cb = float(35442.0 / 1805.0)
        const cc = float(16061.0 / 1805.0)
        const t2 = t.mul(t)
        return t2.mul(7.5625).select(
                t2
                        .mul(9.075)
                        .sub(t.mul(9.9))
                        .add(3.4)
                        .select(
                                t2
                                        .mul(ca)
                                        .sub(t.mul(cb))
                                        .add(cc)
                                        .select(t2.mul(10.8).sub(t.mul(20.52)).add(10.72), t.lessThan(c)),
                                t.lessThan(b)
                        ),
                t.lessThan(a)
        )
}).setLayout({
        name: 'bounceOut',
        type: 'float',
        inputs: [{ name: 't', type: 'float' }],
})
