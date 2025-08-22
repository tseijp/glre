import { Fn, Vec3, Vec2, Float, vec2 } from '../../node'

export const opRevolve = Fn(([p, w]: [Vec3, Float]): Vec2 => {
        return vec2(vec2(p.x, p.z).length().sub(w), p.y)
}).setLayout({
        name: 'opRevolve',
        type: 'vec2',
        inputs: [
                { name: 'p', type: 'vec3' },
                { name: 'w', type: 'float' },
        ],
})
