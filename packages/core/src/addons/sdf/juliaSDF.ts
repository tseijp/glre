import { Fn, Vec2, Float, vec2, float, Loop, If, Break } from '../../node'

export const juliaSDF = Fn(([st, center, c, r]: [Vec2, Vec2, Vec2, Float]): Float => {
        const transformed = st.sub(0.5).mul(2).toVar('transformed')
        const z = vec2(0).sub(transformed).mul(r).toVar('z')
        const n = float(0).toVar('n')
        const maxIter = 500

        Loop(maxIter, ({ i }) => {
                If(z.length().greaterThan(4), () => {
                        n.assign(i.toFloat().div(maxIter))
                        Break()
                })
                z.assign(vec2(z.x.pow(2).sub(z.y.pow(2)).add(c.x), z.x.mul(z.y).mul(2).add(c.y)))
        })

        return n
}).setLayout({
        name: 'juliaSDF',
        type: 'float',
        inputs: [
                { name: 'st', type: 'vec2' },
                { name: 'center', type: 'vec2' },
                { name: 'c', type: 'vec2' },
                { name: 'r', type: 'float' },
        ],
})

export const juliaSDFSimple = Fn(([st, c, r]: [Vec2, Vec2, Float]): Float => {
        return juliaSDF(st, vec2(0.5), c, r)
}).setLayout({
        name: 'juliaSDFSimple',
        type: 'float',
        inputs: [
                { name: 'st', type: 'vec2' },
                { name: 'c', type: 'vec2' },
                { name: 'r', type: 'float' },
        ],
})
