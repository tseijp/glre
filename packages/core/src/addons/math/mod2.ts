import { Fn, Vec2, X, vec4 } from '../../node'

// 2D modulo function that returns both cell coordinates and wrapped position
// Returns vec4(cellX, cellY, wrappedX, wrappedY)
export const mod2 = Fn(([p, s]) => {
        const halfS = s.div(2).toVar()
        const pShifted = p.add(halfS).toVar()
        const c = pShifted.div(s).floor().toVar()
        const wrapped = pShifted.mod(s).sub(halfS)
        return vec4(c.x, c.y, wrapped.x, wrapped.y)
}).setLayout({
        name: 'mod2',
        type: 'vec4',
        inputs: [
                { name: 'p', type: 'vec2' },
                { name: 's', type: 'auto' },
        ],
})

// Utility function to extract cell coordinates from mod2 result
export const mod2Cell = Fn(([p, s]: [Vec2, X]): Vec2 => {
        const result = mod2(p, s)
        return result.xy
}).setLayout({
        name: 'mod2Cell',
        type: 'vec2',
        inputs: [
                { name: 'p', type: 'vec2' },
                { name: 's', type: 'auto' },
        ],
})

// Utility function to extract wrapped position from mod2 result
export const mod2Wrap = Fn(([p, s]: [Vec2, X]): Vec2 => {
        const result = mod2(p, s)
        return result.zw
}).setLayout({
        name: 'mod2Wrap',
        type: 'vec2',
        inputs: [
                { name: 'p', type: 'vec2' },
                { name: 's', type: 'auto' },
        ],
})
