import { Fn, Vec2, Int, Float, float, vec2, floor, ivec2 } from '../../node'

export const charLookupSimple = Fn(([index]: [Int]): Float => {
        const isValidChar = index.greaterThan(31).and(index.lessThan(127))
        return float(0).select(float(1), isValidChar)
}).setLayout({
        name: 'charLookupSimple',
        type: 'float',
        inputs: [{ name: 'index', type: 'int' }],
})

export const charSimple = Fn(([uv, charCode]: [Vec2, Int]): Float => {
        const charCoord = ivec2(floor(uv.mul(vec2(8, 16)))).toVar()
        charCoord.x.assign(charCoord.x.clamp(0, 7))
        charCoord.y.assign(charCoord.y.clamp(0, 15))
        const centerX = charCoord.x.sub(4).abs()
        const centerY = charCoord.y.sub(8).abs()
        const pattern = centerX.add(centerY).lessThan(charCode.mod(8) as any)
        return float(0).select(float(1), pattern)
}).setLayout({
        name: 'charSimple',
        type: 'float',
        inputs: [
                { name: 'uv', type: 'vec2' },
                { name: 'charCode', type: 'int' },
        ],
})

// Default char function using simplified implementation
export const char = charSimple
