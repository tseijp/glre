import { Fn, Vec2, Float, vec2 } from '../../node'
import { rotate2d } from '../math/rotate2d'

export const rotate2DCenter = Fn(([v, r, c]: [Vec2, Float, Vec2]) => {
        return rotate2d(r).mul(v.sub(c)).add(c)
}).setLayout({
        name: 'rotate2DCenter',
        type: 'vec2',
        inputs: [
                { name: 'v', type: 'vec2' },
                { name: 'r', type: 'float' },
                { name: 'c', type: 'vec2' },
        ],
})

export const rotate2DBasic = Fn(([v, r]: [Vec2, Float]) => {
        return rotate2DCenter(v, r, vec2(0.5))
}).setLayout({
        name: 'rotate2DBasic',
        type: 'vec2',
        inputs: [
                { name: 'v', type: 'vec2' },
                { name: 'r', type: 'float' },
        ],
})

export const rotate2DAxis = Fn(([v, xAxis]: [Vec2, Vec2]) => {
        const negYAxis = vec2(xAxis.y.negate(), xAxis.x).toVar()
        return vec2(v.dot(negYAxis), v.dot(xAxis))
}).setLayout({
        name: 'rotate2DAxis',
        type: 'vec2',
        inputs: [
                { name: 'v', type: 'vec2' },
                { name: 'xAxis', type: 'vec2' },
        ],
})
