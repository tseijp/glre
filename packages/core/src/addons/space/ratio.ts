import { Fn, Vec2, mix, vec2, step } from '../../node'

export const ratio = Fn(([v, s]: [Vec2, Vec2]): Vec2 => {
        const wideAspect = vec2(v.x.mul(s.x.div(s.y)).sub(s.x.mul(0.5).sub(s.y.mul(0.5)).div(s.y)), v.y)
        const tallAspect = vec2(v.x, v.y.mul(s.y.div(s.x)).sub(s.y.mul(0.5).sub(s.x.mul(0.5)).div(s.x)))
        return mix(wideAspect, tallAspect, step(s.x, s.y))
}).setLayout({
        name: 'ratio',
        type: 'vec2',
        inputs: [
                { name: 'v', type: 'vec2' },
                { name: 's', type: 'vec2' },
        ],
})
