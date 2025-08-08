import { Fn, Vec2, vec2 } from '../../node'

export const circleSDF = Fn(([v, center]: [Vec2, Vec2]) => {
        return v.sub(center).length().mul(2)
}).setLayout({
        name: 'circleSDF',
        type: 'float',
        inputs: [
                { name: 'v', type: 'vec2' },
                { name: 'center', type: 'vec2' },
        ],
})

export const circleSDFBasic = Fn(([v]: [Vec2]) => {
        return v.sub(vec2(0.5)).length().mul(2)
}).setLayout({
        name: 'circleSDFBasic',
        type: 'float',
        inputs: [{ name: 'v', type: 'vec2' }],
})
