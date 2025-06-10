import {
        interleave,
        isTemplateLiteral,
        concat,
        switchUniformType,
} from 'glre/utils'

describe('utils', () => {
        const _ = (str, ...args) => [str, args] as [any, any]
        const _0 = _`foo${false}bar${undefined}baz${null}`
        const _1 = _`foo${0}bar${NaN}baz${-1}`
        it('interleave merge strings', () => {
                expect(interleave(..._0)).toEqual(`foofalsebarundefinedbaznull`)
                expect(interleave(..._1)).toEqual(`foo0barNaNbaz-1`)
        })
        it('isTemplateLiteral', () => {
                expect(isTemplateLiteral(_0[0])).toEqual(true)
                expect(isTemplateLiteral(_1[0])).toEqual(true)
        })

        const headerUniform = `uniform vec2 iMouse;`
        const withUniform = `void main() { gl_FragColor = vec4(iMouse, 0., 1.); }`
        const noneUniform = `void main() { gl_FragColor = vec4(0., 1., 0., 1.); }`
        it.each`
                i    | key         | shader                         | toBe
                ${0} | ${void 0}   | ${withUniform}                 | ${headerUniform + withUniform}
                ${1} | ${'iMouse'} | ${withUniform}                 | ${headerUniform + withUniform}
                ${2} | ${'iMouse'} | ${noneUniform}                 | ${noneUniform}
                ${3} | ${void 0}   | ${headerUniform + withUniform} | ${headerUniform + withUniform}
                ${4} | ${'iMouse'} | ${headerUniform + withUniform} | ${headerUniform + withUniform}
                ${5} | ${'iMouse'} | ${headerUniform + noneUniform} | ${headerUniform + noneUniform}
        `('concat $i', ({ key, shader, toBe }) => {
                expect(concat(shader, headerUniform, key)).toBe(toBe)
        })
        it.each`
                i    | uniformType           | uniformKey | isMatrix | value
                ${0} | ${'uniform1f'}        | ${'float'} | ${false} | ${10}
                ${1} | ${'uniform2fv'}       | ${'vec2'}  | ${false} | ${[0, 1]}
                ${2} | ${`uniformMatrix2fv`} | ${'mat2'}  | ${true}  | ${[0, 1, 2, 3]}
        `(
                'switchUniformType $i',
                ({ value, isMatrix, uniformType, uniformKey }) => {
                        expect(switchUniformType(value, isMatrix)).toEqual([
                                uniformType,
                                uniformKey,
                        ])
                }
        )
})
