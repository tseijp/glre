import { Fn, vec2, min, Float, Vec2 } from '../../node'
import { rectSDF } from './rectSDF'

export const crossSDF = Fn(([st, s]: [Vec2, Float]): Float => {
        const size = vec2(0.25, s)
        return min(rectSDF(st, size), rectSDF(st, size.yx))
}).setLayout({
        name: 'crossSDF',
        type: 'float',
        inputs: [
                { name: 'st', type: 'vec2' },
                { name: 's', type: 'float' },
        ],
})
