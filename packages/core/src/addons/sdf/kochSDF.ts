import { Fn, Vec2, Int, Float, vec2, mat2, float, Loop, Break, If } from '../../node'

export const kochSDF = Fn(([st, center, N]: [Vec2, Vec2, Int]): Float => {
        st = st.sub(center).toVar()
        st.assign(st.mul(3))
        const r3 = float(3).sqrt().toVar('r3')
        st.assign(st.abs())
        st.assign(st.add(r3.mul(vec2(st.y.negate(), st.x))))
        st.assign(vec2(st.x, st.y.sub(1)))
        const w = float(0.5).toVar('w')
        const m = mat2(r3, 3, -3, r3).mul(0.5).toVar('m')

        Loop(20, ({ i }) => {
                If(i.toFloat().greaterThanEqual(N.toFloat()), () => {
                        Break()
                })
                st.assign(
                        vec2(r3.negate(), 3)
                                .mul(0.5)
                                .sub(m.mul(vec2(st.y, st.x.abs())))
                )
                w.assign(w.div(r3))
        })

        const d = st.y
                .sign()
                .mul(vec2(st.y, st.x.abs().sub(r3).max(0)).length())
                .toVar('d')
        return d.mul(w)
}).setLayout({
        name: 'kochSDF',
        type: 'float',
        inputs: [
                { name: 'st', type: 'vec2' },
                { name: 'center', type: 'vec2' },
                { name: 'N', type: 'int' },
        ],
})

export const kochSDFSimple = Fn(([st, N]: [Vec2, Int]): Float => {
        return kochSDF(st, vec2(0.5), N)
}).setLayout({
        name: 'kochSDFSimple',
        type: 'float',
        inputs: [
                { name: 'st', type: 'vec2' },
                { name: 'N', type: 'int' },
        ],
})
