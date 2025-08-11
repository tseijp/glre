import { Fn, vec2, vec3, vec4, Float, Vec2, Vec3, Vec4, X } from '../../node'

export const scale = Fn(([st, s, center]: [X, X, X]): X => {
        return st.sub(center).mul(s).add(center)
}).setLayout({
        name: 'scale',
        type: 'auto',
        inputs: [
                { name: 'st', type: 'auto' },
                { name: 's', type: 'auto' },
                { name: 'center', type: 'auto' },
        ],
})
