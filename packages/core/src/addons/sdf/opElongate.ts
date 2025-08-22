import { Fn, Vec2, Vec3, Vec4, vec3, vec4 } from '../../node'

export const opElongateVec2 = Fn(([p, h]: [Vec2, Vec2]): Vec2 => {
        return p.sub(p.clamp(h.negate(), h))
}).setLayout({
        name: 'opElongateVec2',
        type: 'vec2',
        inputs: [
                { name: 'p', type: 'vec2' },
                { name: 'h', type: 'vec2' }
        ]
})

export const opElongateVec3 = Fn(([p, h]: [Vec3, Vec3]): Vec3 => {
        return p.sub(p.clamp(h.negate(), h))
}).setLayout({
        name: 'opElongateVec3',
        type: 'vec3',
        inputs: [
                { name: 'p', type: 'vec3' },
                { name: 'h', type: 'vec3' }
        ]
})

export const opElongateVec4 = Fn(([p, h]: [Vec4, Vec4]): Vec4 => {
        const q = p.abs().sub(h).toVar('q')
        return vec4(
                vec3(q.x, q.y, q.z).max(0),
                q.x.max(q.y.max(q.z)).min(0)
        )
}).setLayout({
        name: 'opElongateVec4',
        type: 'vec4',
        inputs: [
                { name: 'p', type: 'vec4' },
                { name: 'h', type: 'vec4' }
        ]
})