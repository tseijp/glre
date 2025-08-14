import { Fn, Vec2, Float, vec2, floor, fract } from '../../node'

export const sprite = Fn(([st, grid, index]: [Vec2, Vec2, Float]): Vec2 => {
        const adjustedIndex = index.add(grid.x).toVar('adjustedIndex')
        const f = vec2(1).div(grid).toVar('f')
        const cell = vec2(floor(adjustedIndex), grid.y.sub(floor(adjustedIndex.mul(f.x)))).toVar('cell')
        return fract(st.add(cell).mul(f))
}).setLayout({
        name: 'sprite',
        type: 'vec2',
        inputs: [
                { name: 'st', type: 'vec2' },
                { name: 'grid', type: 'vec2' },
                { name: 'index', type: 'float' },
        ],
})
