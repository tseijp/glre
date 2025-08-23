import { Fn, Vec2, Float, vec2, float } from '../../node'

export const vesicaSDF = Fn(([st, w]: [Vec2, Float]): Float => {
        const offset = vec2(w.mul(0.5), 0)
        const circle1 = st.sub(offset).length().sub(0.5)
        const circle2 = st.add(offset).length().sub(0.5)
        return circle1.max(circle2)
}).setLayout({
        name: 'vesicaSDF',
        type: 'float',
        inputs: [
                { name: 'st', type: 'vec2' },
                { name: 'w', type: 'float' },
        ],
})

export const vesicaSDFDefault = Fn(([st]: [Vec2]): Float => {
        return vesicaSDF(st, float(0.5))
}).setLayout({
        name: 'vesicaSDFDefault',
        type: 'float',
        inputs: [{ name: 'st', type: 'vec2' }],
})
