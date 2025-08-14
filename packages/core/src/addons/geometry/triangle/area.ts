import { Fn, Float, length, cross } from '../../../node'
import { TriangleType } from './triangle'

export const area = Fn(([tri]: [TriangleType]): Float => {
        return length(cross(tri.b.sub(tri.a), tri.c.sub(tri.a))).mul(0.5)
}).setLayout({
        name: 'area',
        type: 'float',
        inputs: [{ name: 'tri', type: 'auto' }],
})
