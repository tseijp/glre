import { Fn, Vec3, Float, vec3 } from '../../node'
import { boxSDFSize } from './boxSDF'

export const cubeSDF = Fn(([p, s]: [Vec3, Float]): Float => {
        return boxSDFSize(p, vec3(s))
}).setLayout({
        name: 'cubeSDF',
        type: 'float',
        inputs: [
                { name: 'p', type: 'vec3' },
                { name: 's', type: 'float' },
        ],
})
