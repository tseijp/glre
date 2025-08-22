import { Fn, Vec3, Vec2, Float, vec2, select } from '../../node'

export const torusSDF = Fn(([p, t]: [Vec3, Vec2]): Float => {
        return vec2(vec2(p.x, p.z).length().sub(t.x), p.y).length().sub(t.y)
}).setLayout({
        name: 'torusSDF',
        type: 'float',
        inputs: [
                { name: 'p', type: 'vec3' },
                { name: 't', type: 'vec2' },
        ],
})

export const torusSDFSector = Fn(([p, sc, ra, rb]: [Vec3, Vec2, Float, Float]): Float => {
        const px = p.x.abs().toVar('px')
        const k = select(vec2(px, p.y).length(), vec2(px, p.y).dot(sc), sc.y.mul(px).greaterThan(sc.x.mul(p.y)))
        return p.dot(p).add(ra.mul(ra)).sub(ra.mul(k).mul(2)).sqrt().sub(rb)
}).setLayout({
        name: 'torusSDFSector',
        type: 'float',
        inputs: [
                { name: 'p', type: 'vec3' },
                { name: 'sc', type: 'vec2' },
                { name: 'ra', type: 'float' },
                { name: 'rb', type: 'float' },
        ],
})
