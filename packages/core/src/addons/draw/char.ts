import { Fn, Vec2, Float, Int, int, vec2, ivec2, ivec4, floor, pow, If } from '../../node'
import { modi } from '../math/modi'

// Character constants
export const CHAR_SIZE = vec2(0.02)
export const CHAR_TOTAL = 96

// Character codes
export const CHAR = {
        SPACE: 0,
        EXCLAMATION: 1,
        QUOTE: 2,
        NUMBER: 3,
        DOLLAR: 4,
        PERCENT: 5,
        AMPERSAND: 6,
        APOSTROPHE: 7,
        PAREN_LEFT: 8,
        PAREN_RIGHT: 9,
        ASTERISK: 10,
        PLUS: 11,
        COMMA: 12,
        MINUS: 13,
        PERIOD: 14,
        SLASH: 15,
        0: 16,
        1: 17,
        2: 18,
        3: 19,
        4: 20,
        5: 21,
        6: 22,
        7: 23,
        8: 24,
        9: 25,
        COLON: 26,
        SEMICOLON: 27,
        LESS: 28,
        EQUAL: 29,
        GREATER: 30,
        QUESTION: 31,
        AT: 32,
        A: 33,
        B: 34,
        C: 35,
        D: 36,
        E: 37,
        F: 38,
        G: 39,
        H: 40,
        I: 41,
        J: 42,
        K: 43,
        L: 44,
        M: 45,
        N: 46,
        O: 47,
        P: 48,
        Q: 49,
        R: 50,
        S: 51,
        T: 52,
        U: 53,
        V: 54,
        W: 55,
        X: 56,
        Y: 57,
        Z: 58,
        BRACKET_LEFT: 59,
        BACKSLASH: 60,
        BRACKET_RIGHT: 61,
        CARET: 62,
        UNDERSCORE: 63,
        GRAVE: 64,
        a: 65,
        b: 66,
        c: 67,
        d: 68,
        e: 69,
        f: 70,
        g: 71,
        h: 72,
        i: 73,
        j: 74,
        k: 75,
        l: 76,
        m: 77,
        n: 78,
        o: 79,
        p: 80,
        q: 81,
        r: 82,
        s: 83,
        t: 84,
        u: 85,
        v: 86,
        w: 87,
        x: 88,
        y: 89,
        z: 90,
        BRACE_LEFT: 91,
        BAR: 92,
        BRACE_RIGHT: 93,
        TILDE: 94,
}

// Character bitmap data (compressed)
const CHAR_DATA: [number, number, number, number][] = [
        [0x0, 0x0, 0x0, 0x0],
        [0x1010, 0x10101010, 0x1010, 0x0],
        [0x242424, 0x24000000, 0x0, 0x0],
        [0x24, 0x247e2424, 0x247e2424, 0x0],
        [0x808, 0x1e20201c, 0x2023c08, 0x8000000],
        [0x30, 0x494a3408, 0x16294906, 0x0],
        [0x3048, 0x48483031, 0x49464639, 0x0],
        [0x101010, 0x10000000, 0x0, 0x0],
        [0x408, 0x8101010, 0x10101008, 0x8040000],
        [0x2010, 0x10080808, 0x8080810, 0x10200000],
        [0x0, 0x24187e, 0x18240000, 0x0],
        [0x0, 0x808087f, 0x8080800, 0x0],
        [0x0, 0x0, 0x1818, 0x8081000],
        [0x0, 0x7e, 0x0, 0x0],
        [0x0, 0x0, 0x1818, 0x0],
        [0x202, 0x4040808, 0x10102020, 0x40400000],
        [0x3c, 0x42464a52, 0x6242423c, 0x0],
        [0x8, 0x18280808, 0x808083e, 0x0],
        [0x3c, 0x42020204, 0x810207e, 0x0],
        [0x7e, 0x4081c02, 0x202423c, 0x0],
        [0x4, 0xc142444, 0x7e040404, 0x0],
        [0x7e, 0x40407c02, 0x202423c, 0x0],
        [0x1c, 0x2040407c, 0x4242423c, 0x0],
        [0x7e, 0x2040408, 0x8101010, 0x0],
        [0x3c, 0x4242423c, 0x4242423c, 0x0],
        [0x3c, 0x4242423e, 0x2020438, 0x0],
        [0x0, 0x181800, 0x1818, 0x0],
        [0x0, 0x181800, 0x1818, 0x8081000],
        [0x4, 0x8102040, 0x20100804, 0x0],
        [0x0, 0x7e00, 0x7e0000, 0x0],
        [0x20, 0x10080402, 0x4081020, 0x0],
        [0x3c42, 0x2040810, 0x1010, 0x0],
        [0x1c22, 0x414f5151, 0x51534d40, 0x201f0000],
        [0x18, 0x24424242, 0x7e424242, 0x0],
        [0x7c, 0x4242427c, 0x4242427c, 0x0],
        [0x1e, 0x20404040, 0x4040201e, 0x0],
        [0x78, 0x44424242, 0x42424478, 0x0],
        [0x7e, 0x4040407c, 0x4040407e, 0x0],
        [0x7e, 0x4040407c, 0x40404040, 0x0],
        [0x1e, 0x20404046, 0x4242221e, 0x0],
        [0x42, 0x4242427e, 0x42424242, 0x0],
        [0x3e, 0x8080808, 0x808083e, 0x0],
        [0x2, 0x2020202, 0x242423c, 0x0],
        [0x42, 0x44485060, 0x50484442, 0x0],
        [0x40, 0x40404040, 0x4040407e, 0x0],
        [0x41, 0x63554949, 0x41414141, 0x0],
        [0x42, 0x62524a46, 0x42424242, 0x0],
        [0x3c, 0x42424242, 0x4242423c, 0x0],
        [0x7c, 0x4242427c, 0x40404040, 0x0],
        [0x3c, 0x42424242, 0x4242423c, 0x4020000],
        [0x7c, 0x4242427c, 0x48444242, 0x0],
        [0x3e, 0x40402018, 0x402027c, 0x0],
        [0x7f, 0x8080808, 0x8080808, 0x0],
        [0x42, 0x42424242, 0x4242423c, 0x0],
        [0x42, 0x42424242, 0x24241818, 0x0],
        [0x41, 0x41414149, 0x49495563, 0x0],
        [0x41, 0x41221408, 0x14224141, 0x0],
        [0x41, 0x41221408, 0x8080808, 0x0],
        [0x7e, 0x4080810, 0x1020207e, 0x0],
        [0x1e10, 0x10101010, 0x10101010, 0x101e0000],
        [0x4040, 0x20201010, 0x8080404, 0x2020000],
        [0x7808, 0x8080808, 0x8080808, 0x8780000],
        [0x1028, 0x44000000, 0x0, 0x0],
        [0x0, 0x0, 0x0, 0xff0000],
        [0x201008, 0x4000000, 0x0, 0x0],
        [0x0, 0x3c0202, 0x3e42423e, 0x0],
        [0x4040, 0x407c4242, 0x4242427c, 0x0],
        [0x0, 0x3c4240, 0x4040423c, 0x0],
        [0x202, 0x23e4242, 0x4242423e, 0x0],
        [0x0, 0x3c4242, 0x7e40403e, 0x0],
        [0xe10, 0x107e1010, 0x10101010, 0x0],
        [0x0, 0x3e4242, 0x4242423e, 0x2023c00],
        [0x4040, 0x407c4242, 0x42424242, 0x0],
        [0x808, 0x380808, 0x808083e, 0x0],
        [0x404, 0x1c0404, 0x4040404, 0x4043800],
        [0x4040, 0x40444850, 0x70484442, 0x0],
        [0x3808, 0x8080808, 0x808083e, 0x0],
        [0x0, 0x774949, 0x49494949, 0x0],
        [0x0, 0x7c4242, 0x42424242, 0x0],
        [0x0, 0x3c4242, 0x4242423c, 0x0],
        [0x0, 0x7c4242, 0x4242427c, 0x40404000],
        [0x0, 0x3e4242, 0x4242423e, 0x2020200],
        [0x0, 0x2e3020, 0x20202020, 0x0],
        [0x0, 0x3e4020, 0x1804027c, 0x0],
        [0x10, 0x107e1010, 0x1010100e, 0x0],
        [0x0, 0x424242, 0x4242423e, 0x0],
        [0x0, 0x424242, 0x24241818, 0x0],
        [0x0, 0x414141, 0x49495563, 0x0],
        [0x0, 0x412214, 0x8142241, 0x0],
        [0x0, 0x424242, 0x4242423e, 0x2023c00],
        [0x0, 0x7e0408, 0x1020407e, 0x0],
        [0xe1010, 0x101010e0, 0x10101010, 0x100e0000],
        [0x80808, 0x8080808, 0x8080808, 0x8080000],
        [0x700808, 0x8080807, 0x8080808, 0x8700000],
        [0x3149, 0x46000000, 0x0, 0x0],
]

const charLUT = Fn(([index]: [Int]) => {
        const result = ivec4(0).toVar('result')
        let ifChain = If(index.equal(int(0)), () => void result.assign(ivec4(...CHAR_DATA[0])))
        for (let i = 1; i < CHAR_DATA.length; i++)
                ifChain = ifChain.ElseIf(index.equal(int(i)), () => void result.assign(ivec4(...CHAR_DATA[i])))
        return result
}).setLayout({
        name: 'charLUT',
        type: 'ivec4',
        inputs: [{ name: 'index', type: 'int' }],
})

export const char = Fn(([uv, charCode]: [Vec2, Int]): Float => {
        const charCoord = ivec2(7, 15)
                .sub(floor(uv.mul(vec2(8, 16))).toIVec2())
                .toVar('charCoord')
        const col = charLUT(charCode).toVar('col')
        const fourLines = int(0).toVar('fourLines')
        const index = charCoord.y.toFloat().div(4).floor().toInt().toVar('index')

        If(index.equal(int(0)), () => void fourLines.assign(col.x))
                .ElseIf(index.equal(int(1)), () => void fourLines.assign(col.y))
                .ElseIf(index.equal(int(2)), () => void fourLines.assign(col.z))
                .Else(() => void fourLines.assign(col.w))

        const yMod4 = modi(charCoord.y as unknown as Int, int(4)).toVar('yMod4')
        const exponent = int(3).sub(yMod4).toVar('exponent')
        const divisor = pow(int(256).toFloat(), exponent.toFloat()).toInt().toVar('divisor')
        const currentLine = modi(fourLines.div(divisor), int(256)).toVar('currentLine')

        const pixelDivisor = pow(int(2).toFloat(), charCoord.x.toFloat()).toInt().toVar('pixelDivisor')
        const currentPixel = modi(currentLine.div(pixelDivisor), int(2)).toVar('currentPixel')

        return currentPixel.toFloat()
}).setLayout({
        name: 'char',
        type: 'float',
        inputs: [
                { name: 'uv', type: 'vec2' },
                { name: 'charCode', type: 'int' },
        ],
})
