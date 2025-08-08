import { Fn, Vec2, Float, vec2 } from '../../node'

export const rectSDFBasic = Fn(([st]: [Vec2]) => {
        const normalizedSt = st.mul(2).sub(1).toVar()
        return normalizedSt.x.abs().max(normalizedSt.y.abs())
}).setLayout({
        name: 'rectSDFBasic',
        type: 'float',
        inputs: [{ name: 'st', type: 'vec2' }],
})

export const rectSDF = Fn(([st, s]: [Vec2, Vec2]) => {
        const normalizedSt = st.mul(2).sub(1).toVar()
        return normalizedSt.x.div(s.x).abs().max(normalizedSt.y.div(s.y).abs())
}).setLayout({
        name: 'rectSDF',
        type: 'float',
        inputs: [
                { name: 'st', type: 'vec2' },
                { name: 's', type: 'vec2' },
        ],
})

export const rectSDFUniform = Fn(([st, s]: [Vec2, Float]) => {
        return rectSDF(st, vec2(s))
}).setLayout({
        name: 'rectSDFUniform',
        type: 'float',
        inputs: [
                { name: 'st', type: 'vec2' },
                { name: 's', type: 'float' },
        ],
})

export const rectSDFRounded = Fn(([p, b, r]: [Vec2, Vec2, Float]) => {
        const d = p.sub(0.5).mul(4.2).abs().sub(b).add(vec2(r)).toVar()
        return d.x.max(d.y).min(0).add(d.max(0).length()).sub(r)
}).setLayout({
        name: 'rectSDFRounded',
        type: 'float',
        inputs: [
                { name: 'p', type: 'vec2' },
                { name: 'b', type: 'vec2' },
                { name: 'r', type: 'float' },
        ],
})
